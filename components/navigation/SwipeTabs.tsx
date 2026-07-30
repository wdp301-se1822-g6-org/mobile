import {
  createMaterialTopTabNavigator,
  type MaterialTopTabNavigationEventMap,
  type MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs';
import type { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { withLayoutContext } from 'expo-router';

const { Navigator } = createMaterialTopTabNavigator();

// expo-router chỉ export sẵn <Tabs> (bottom-tabs) và <Stack>, mà bottom-tabs không
// có pager nên không vuốt được. withLayoutContext là API chính thức để gắn một
// navigator bất kỳ vào cây route file-based.
export const SwipeTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);
