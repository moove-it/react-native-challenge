import {
  Text,
  View,
  Image,
  SafeAreaView,
  Alert,
  Pressable,
  useColorScheme,
} from 'react-native';
import {
  PlayIcon,
  RewindIcon,
  ForwardIcon,
  PauseIcon,
} from '../../assets/images';
import React, {useEffect, useMemo, useState} from 'react';
import Sound from 'react-native-sound';
import {VOLUME, DARK, SONG_ERROR} from '../../constants/en';
import {styles} from './SongInfo.styles';
import {useRoute} from '@react-navigation/native';
import {stylesDark} from './SongInfoDark.styles';
import {useDispatch} from 'react-redux';
import {showSoundBar} from '../../redux/Actions';

export function SongInfo() {
  const theme = useColorScheme();
  const isDarkTheme = theme === DARK;
  const [isPlaying, setPlaying] = useState(false);
  const route = useRoute();
  const dispatch = useDispatch();
  var show = false;
  const sound = useMemo(() => {
    return new Sound(route.params.item.preview, null, error => {
      if (error) {
        console.log(error.message);
        Alert.alert(SONG_ERROR, [
          {text: 'OK', onPress: () => console.log(error.message)},
        ]);
      }
    });
  }, [route]);

  useEffect(() => {
    sound.setVolume(VOLUME);
  });

  const playPause = () => {
    if (sound.isPlaying()) {
      show = false;
      setPlaying(false);
      sound.pause();
    } else {
      show = true;
      setPlaying(true);
      sound.play();
    }
    dispatch(
      showSoundBar({
        trackName: route.params.item.trackName,
        preview: route.params.item.preview,
        artwork: route.params.item.artwork,
        artist: route.params.item.artist,
        sound: sound,
        show: show,
      }),
    );
  };
  const jumpPrev15Seconds = () => {
    jumpSeconds(-10);
  };
  const jumpNext15Seconds = () => {
    jumpSeconds(10);
  };

  const jumpSeconds = secondsToJump => {
    sound.getCurrentTime(seconds => {
      var time = seconds + secondsToJump;
      if (time < 0) {
        time = 0;
      } else if (time > sound.getDuration) {
        time = sound.getDuration;
      }
      sound.setCurrentTime(time);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      sound.getCurrentTime(seconds => {
        if (seconds === 0) {
          setPlaying(false);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <SafeAreaView
      style={
        isDarkTheme === true ? stylesDark.containerDark : styles.container
      }>
      <View>
        <View>
          <Image
            style={styles.imageHeader}
            accessibilityIgnoresInvertColors={true}
            source={{uri: `${route.params.item.artwork}`}}
          />
        </View>
        <Text
          style={
            isDarkTheme === true ? stylesDark.textTitleDark : styles.textTitle
          }>
          {route.params.item.trackName}
        </Text>
        <Text
          style={
            isDarkTheme === true ? stylesDark.textTitleDark : styles.textTitle
          }>
          {route.params.item.artist}
        </Text>
        <View style={styles.playerContainer}>
          <Pressable onPress={jumpPrev15Seconds}>
            <Image
              style={styles.itemRewindForwardStyle}
              accessibilityIgnoresInvertColors={true}
              source={RewindIcon}
            />
          </Pressable>
          <Pressable onPress={playPause}>
            <Image
              style={styles.itemPlayStyle}
              accessibilityIgnoresInvertColors={true}
              source={isPlaying ? PauseIcon : PlayIcon}
            />
          </Pressable>
          <Pressable onPress={jumpNext15Seconds}>
            <Image
              style={styles.itemRewindForwardStyle}
              accessibilityIgnoresInvertColors={true}
              source={ForwardIcon}
            />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
