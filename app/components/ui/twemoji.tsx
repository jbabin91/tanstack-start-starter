import twemoji from '@twemoji/api';
import * as React from 'react';
import { type Country } from 'react-phone-number-input';
import { type Except } from 'type-fest';

import { cn } from '@/lib/utils';

const BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest';

type TwemojiProps = React.ComponentProps<'img'> & {
  emoji: string;
  format?: 'svg' | 'png';
};

function Twemoji({ emoji, format = 'svg', className, ...props }: TwemojiProps) {
  const decodedEmoji = decodeUnicodeEscapes(emoji);
  const codePoint = twemoji.convert.toCodePoint(decodedEmoji);
  const folder = format === 'svg' ? 'svg' : '72x72';
  const url = `${BASE}/assets/${folder}/${codePoint}.${format}`;

  return (
    <img
      alt={decodedEmoji}
      className={cn('inline-block size-[1.2em] align-text-bottom', className)}
      src={url}
      {...props}
    />
  );
}

type TwemojiFlagProps = Except<TwemojiProps, 'emoji'> & {
  countryCode: Country;
};

function TwemojiFlag({ countryCode, ...props }: TwemojiFlagProps) {
  const emoji = countryCodeToEmoji(countryCode);

  return <Twemoji emoji={emoji} {...props} />;
}

function decodeUnicodeEscapes(inputStr: string) {
  return inputStr.replaceAll(/\\u([\da-f]{4})/gi, (_, grp) =>
    String.fromCodePoint(Number.parseInt(grp, 16)),
  );
}

function countryCodeToEmoji(countryCode: Country): string {
  if (countryCode.length !== 2) throw new Error('Invalid country code');

  const codePoints = [...countryCode.toUpperCase()].map(
    (char) => 0x1_f1_e6 + char.codePointAt(0)! - 65,
  );

  return String.fromCodePoint(...codePoints);
}

export { Twemoji, TwemojiFlag };
