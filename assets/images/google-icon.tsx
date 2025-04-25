import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function GoogleIcon(props: any) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M21.823 10.186h-9.819v3.637h5.608c-.52 2.583-2.728 3.637-5.608 3.637a6.182 6.182 0 01-6.182-6.182c0-3.41 2.772-6.182 6.182-6.182 1.458 0 2.772.52 3.819 1.367l2.728-2.728C16.823 2.137 14.232 1 11.5 1 5.682 1 1 5.682 1 11.5S5.682 22 11.5 22c5.304 0 10.137-3.819 10.137-10.637 0-.39-.043-.781-.087-1.177z"
        fill="#FFF"
      />
    </Svg>
  );
} 