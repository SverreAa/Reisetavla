import { Root, AppHeader, Note } from 'reisetavla-ds';

export const Screen = () => (
  <Root screen>
    <AppHeader live />
    <Note>Alt innhold ligger inni Root. Den setter font, farger og bakgrunn.</Note>
  </Root>
);

export const Dark = () => (
  <Root screen theme="dark">
    <AppHeader live />
    <Note>Samme skjerm i mørkt tema.</Note>
  </Root>
);
