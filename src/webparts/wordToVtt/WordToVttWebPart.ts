import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'WordToVttWebPartStrings';
import WordToVtt from './components/WordToVtt';
import { IWordToVttProps } from './components/IWordToVttProps';

export interface IWordToVttWebPartProps {}

export default class WordToVttWebPart extends BaseClientSideWebPart<IWordToVttWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IWordToVttProps> = React.createElement(
      WordToVtt,
      {}
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: []
        }
      ]
    };
  }
}
