'use strict';









const messengerObj = messenger();
const btn = document.querySelector('button#talk');
btn.onclick = function() {
  messengerObj.you();
  recognition.start();
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-IN';
recognition.interimResults = false;
recognition.addEventListener('result', e => {
  var message = e.results[0][0].transcript;
  messengerObj.you(message);
  messengerObj.bot();
  socket.emit('voice message', message);
});

recognition.onsoundstart = toggleBtnAnimation;
recognition.onsoundend = toggleBtnAnimation;

function toggleBtnAnimation() {
  if (btn.classList.contains('animate')) {
    // remove class after animation is done
    var event = btn.addEventListener("animationiteration", ele => {
      console.log('ended');
      btn.classList.remove('animate');
      btn.removeEventListener('animationiteration', event);
    });
  } else {
    btn.classList.add('animate');
  }
}

const socket = io();
socket.on('bot response', botMessage => {
  speak(botMessage);
  messengerObj.bot(botMessage);
});

function speak(textToSpeak) {



  var speechUtteranceChunker = function (utt, settings, callback) {
    settings = settings || {};
    var newUtt;
    var txt = (settings && settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text);
    if (utt.voice && utt.voice.voiceURI === 'native') { // Not part of the spec
        newUtt = utt;
        newUtt.text = txt;
        newUtt.addEventListener('end', function () {
            if (speechUtteranceChunker.cancel) {
                speechUtteranceChunker.cancel = false;
            }
            if (callback !== undefined) {
                callback();
            }
        });
    }
    else {
        var chunkLength = (settings && settings.chunkLength) || 160;
        var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');
        var chunkArr = txt.match(pattRegex);

        if (chunkArr[0] === undefined || chunkArr[0].length <= 2) {
            //call once all text has been spoken...
            if (callback !== undefined) {
                callback();
            }
            return;
        }
        var chunk = chunkArr[0];
        newUtt = new SpeechSynthesisUtterance(chunk);
        newUtt.lang='id-ID';
        var x;
        for (x in utt) {
            if (utt.hasOwnProperty(x) && x !== 'text') {
                newUtt[x] = utt[x];
            }
        }
        newUtt.addEventListener('end', function () {
            if (speechUtteranceChunker.cancel) {
                speechUtteranceChunker.cancel = false;
                return;
            }
            settings.offset = settings.offset || 0;
            settings.offset += chunk.length - 1;
            speechUtteranceChunker(utt, settings, callback);
        });
    }

    if (settings.modifier) {
        settings.modifier(newUtt);
    }
    console.log(newUtt); //IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
    //placing the speak invocation inside a callback fixes ordering and onend issues.
    setTimeout(function () {

      //speechSynthesis.lang=bahasa;

      speechSynthesis.speak(newUtt);
    }, 0);
};


  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.lang = 'id-ID';

  speechUtteranceChunker(utterance, {
    chunkLength: 100
  }, function () {
    //some code to execute when done
    console.log('done');
  });

  
  synth.speak(utterance);
}

// Handle updating of bot & you messages
function messenger() {
  const you = document.querySelector('#you');
  const bot = document.querySelector('#bot');

  function updateMessage(msg) {
    console.log('this is ', this);
    msg = msg || this.getAttribute('default-message');
    this.innerHTML = '&nbsp;' + msg;
  }

  return {
    bot: updateMessage.bind(bot),
    you: updateMessage.bind(you)
  }
}