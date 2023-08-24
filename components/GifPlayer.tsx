import * as React from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  URL_PAUSED_SUFFIX,
  URL_PLAYING_SUFFIX,
  URL_PREFIX,
} from '../constants/AppConst';

export default function GifPlayer(props: any) {
  const [playing, setPlaying] = React.useState(false);

  const {id, width, height} = props;

  const url =
    URL_PREFIX + id + (playing ? URL_PLAYING_SUFFIX : URL_PAUSED_SUFFIX);

  return (
    <TouchableOpacity
      onPress={() => setPlaying(playing => !playing)}
      style={styles.container}>
      <ImageBackground
        source={{uri: url}}
        style={{width, height, justifyContent: 'center', alignItems: 'center'}}
        imageStyle={{opacity: playing ? 1.0 : 0.2}}>
        {playing == false ? (
          <Image
            style={{width: 40, height: 40}}
            source={require('../assets/gif.webp')}
          />
        ) : null}
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
