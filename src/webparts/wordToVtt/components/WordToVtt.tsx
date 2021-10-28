import * as React from 'react';
import * as moment from 'moment';
import { IWordToVttProps } from './IWordToVttProps';
import { chunk, findIndex } from '@microsoft/sp-lodash-subset';
import { TextField, Slider, DefaultButton } from '@fluentui/react';

export interface Sub {
  startTime: moment.Moment;
  endTime: moment.Moment;
  speaker: String;
  text: String;
}

export default class WordToVtt extends React.Component<IWordToVttProps, {text: string, speed: number}> {

  public constructor(props: IWordToVttProps) {
    super(props);
    this.state = {text: '', speed: 12.5};
  }

  public render(): React.ReactElement<IWordToVttProps> {
    const vtt = this.generateVTT();
    return (<>
      <TextField 
        label="Lim inn tekst fra Word-transkribering her"
        multiline rows={5}
        onChange={(_, v)=>this.setState({'text': v})}
      />
      <br />
      <Slider 
        label="Lesehastighet (målt i tegn per sekund, standard er 12,5)"
        min={5} max={20} defaultValue={12.5} step={0.5}
        onChange={v=>this.setState({'speed': v})}
        showValue
      />
      <TextField 
        label="Generert VTT"
        multiline rows={5}
        value={vtt} readOnly
        onFocus={e => e.target.select()}
      />
      <br />
      <DefaultButton
        text="Last ned fil (subs.vtt)"
        href={`data:text/vtt;charset=UTF-8,${encodeURIComponent(vtt)}`}
        download="subs.vtt"
      />
    </>);
  }
  public generateVTT = () => {
    const {text, speed} = this.state;
    const findSubPattern = /^(\d\d\:\d\d\:\d\d)\s?(.*)$/;
    const wordTimeFormat = "HH:mm:ss";
    const vttTimeFormat = "HH:mm:ss.SSS";
    try {
      // construct array and remove empty lines
      const lines: string[] = text.split(/\r?\n/).filter(v => v.trim() !== "");
      let subs: Sub[] = [];
      // find first timecode
      lines.splice(0, findIndex(lines, l => l.match(findSubPattern) !== null));
      while (lines.length) {
        // extract timecode and speaker
        const [, startTimeString, speaker] = lines.shift().match(findSubPattern) || [];
        // extract subText, making sure we get the last sub as well
        const subText  = findIndex(lines, l => l.match(findSubPattern) !== null) !== -1
          ? lines.splice(0,findIndex(lines, l => l.match(findSubPattern) !== null)).join("\n")
          : lines.splice(0).join("\n"); // last sub
        const startTime = moment(startTimeString, wordTimeFormat);
        // check if start time and subText is valid and push sub to subs array
        if (startTime.isValid() && subText) subs.push({
            startTime: startTime,
            endTime: startTime.clone().add(Math.max(2.5, subText.length/speed),'seconds'),
            speaker: speaker && speaker.trim(),
            text: subText.trim(),
        });
      }
      return `WEBVTT\n\n${subs.map(v=>
        `${v.startTime.format(vttTimeFormat)} --> ${v.endTime.format(vttTimeFormat)}\n${v.speaker && `<v ${v.speaker}>`}${v.text}${v.speaker && `</v>`}`
      ).join("\n\n")}`;
    } catch (e) {
      console.log(e);
      return `Klarte ikke å lage VTT. Har du husket å ta med tidskodene fra transkriberingen?\n\n${e}`;
    }
  }
}
