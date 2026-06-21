import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Dimensions, PanResponder, Platform } from 'react-native';

const EDGE_WIDTH = 30;
const MIN_SWIPE_DISTANCE = 60;
const MAX_VERTICAL_DRIFT = 80;

export function useEdgeSwipeBack() {
  const router = useRouter();
  const startX = useRef(0);
  const routerRef = useRef(router);
  routerRef.current = router;

  const screenWidth = Dimensions.get('window').width;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt) => {
        startX.current = evt.nativeEvent.pageX;
        return false;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const fromLeft = startX.current <= EDGE_WIDTH;
        const fromRight = startX.current >= screenWidth - EDGE_WIDTH;
        const isHorizontal =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dy) < MAX_VERTICAL_DRIFT;
        return (fromLeft || fromRight) && isHorizontal;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) >= MIN_SWIPE_DISTANCE) {
          routerRef.current.back();
        }
      },
    })
  ).current;

  if (Platform.OS === 'ios') return {};

  return panResponder.panHandlers;
}
