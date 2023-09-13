radio.setGroup(83)
let mute = false
let solo = false
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    parseSerial(serial.readUntil(serial.delimiters(Delimiters.NewLine)))  
})

function triggerDisplayNote(thisNote: number){
    let displayNoteNumber = thisNote % 4
    displayResetTimer = input.runningTime()
    if (displayNoteNumber < 2) {
        led.plot(displayNoteNumber, 4)//basic.showNumber(stepNumber, 1)
    } else {
        led.plot(displayNoteNumber + 1, 4)//basic.showNumber(stepNumber, 1)
    }
}

let displayResetTimer= 0
function parseSerial(stringy: string) {
    stringy = stringy.slice(0, -1) // remove last char which is newline i think
    let stringyArray = stringy.split("#") // make an array
    for (let i = 0; i < stringyArray.length; i++) {
        let thisData = stringyArray[i]
        switch (thisData[0]) {
            case "s":
                // SOLO OFF
                solo = false
                //basic.showIcon(IconNames.Heart,0)
                displayResetTimer = input.runningTime()
                radio.sendValue("uma", 0) // unmute musicians
                break
            case "n":
                let noteBits = 0b0000000000000000
                for (let i = 1; i < thisData.length; i++) {
                    let thisNote = parseInt(thisData[i])
                    let thisBit = 0b0000000000000001 << thisNote
                    noteBits = thisBit | noteBits // add bit to noteBits
                    triggerDisplayNote(thisNote)
                }
                radio.setGroup(83)
                radio.sendValue("RabP", noteBits)
                break
            case "M":
                //MUTE ON
                radio.sendValue("m",0b100000000) // mute thumpers
                mute = true
                break
            case "m":
                //MUTE Off
                radio.sendValue("m", 0b000000000) // unmute thumpers
                mute = false
                break
            case "S":
                // SOLO ON
                solo = true
                let soloMusicianNumber = parseInt("" + thisData[1] + thisData[2])
                radio.sendValue("ms", soloMusicianNumber) // unmute musicians
                //console.log("solo musician " + soloMusicianNumber)
                break
            case "t":
                let stepNumber = parseInt("" + thisData[1] + thisData[2])
                radio.setGroup(84)
                radio.sendValue("t", stepNumber)
                
                displayResetTimer = input.runningTime()
                let displayStepNumber = stepNumber % 4
                if(displayStepNumber < 2){
                    led.plot(displayStepNumber,0)//basic.showNumber(stepNumber, 1)
                } else {
                    led.plot(displayStepNumber+1, 0)//basic.showNumber(stepNumber, 1)
                }

                break
            default:
                basic.showIcon(IconNames.Confused)
                break
        }
    }
}

basic.forever(function() {
updateMuteAndSoloLeds
})

function updateMuteAndSoloLeds(){
    if (input.runningTime() > displayResetTimer + 50) {
        basic.clearScreen()
        led.plot(2, 2)
        if (mute) {
            led.plot(2, 0)
        }
        if (solo) {
            led.plot(2, 4)
        }
    }
}