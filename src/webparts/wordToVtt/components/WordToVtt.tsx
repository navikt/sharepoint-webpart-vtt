import * as React from 'react';
import * as moment from 'moment';
import { IWordToVttProps } from './IWordToVttProps';
import { chunk, findIndex } from '@microsoft/sp-lodash-subset';
import { TextField, Slider, DefaultButton } from '@fluentui/react';

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
    try {
      const lines: string[] = text.split(/\r?\n/).filter(v=>v.trim()!=="");
      lines.splice(0, findIndex(lines, l => l.match(/^\d\d\:\d\d\:\d\d.*$/) !== null));
      const subtitles = chunk(lines, 2).map((val, index) => {
        let [, startTimeString, speaker] = val[0].match(/^(\d\d\:\d\d\:\d\d)\s?(.*)$/) || [];
        const sub = val[1].trim();
        const startTime = moment(startTimeString, "HH:mm:ss");
        if (startTime.isValid()) return {
          startTime: startTime.format("HH:mm:ss.SSS"),
          endTime: startTime.add(Math.max(2.5, sub.length/speed),'seconds').format("HH:mm:ss.SSS"),
          speaker: speaker && speaker.trim(),
          sub,
        };
        else throw new Error(`Klarte ikke å lese tidskode (linje ${index+1})`);
      });
      return `WEBVTT\n\n${subtitles.map(v=>
        `${v.startTime} --> ${v.endTime}\n${v.speaker && `<v ${v.speaker}>`}${v.sub}`
      ).join("\n\n")}`;
    } catch (e) {
      console.log(e);
      return `Klarte ikke å lage VTT. Har du husket å ta med tidskodene fra transkriberingen?\n\n${e}`;
    }
  }
}
