import { useEdgeSwipeBack } from '@/hooks/useEdgeSwipeBack';
import { StyleSheet, View, type ViewProps } from 'react-native';

type Props = ViewProps & {
  children: React.ReactNode;
};

export function SwipeableScreen({ children, style, ...props }: Props) {
  const swipeHandlers = useEdgeSwipeBack();

  return (
    <View
      style={[styles.container, style]}
      collapsable={false}
      {...props}
      {...swipeHandlers}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
