import { Colors } from '@/constants/Colors';
import { Text as DefaultText, View as DefaultView } from 'react-native';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  return <DefaultText style={[{ color: lightColor ?? Colors.textPrimary }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  return <DefaultView style={[{ backgroundColor: lightColor ?? Colors.background }, style]} {...otherProps} />;
}
