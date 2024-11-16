import {
  Link as RouterLink,
  type LinkComponentProps,
  type RegisteredRouter,
} from '@tanstack/react-router';
import type * as React from 'react';

import { type FileRouteTypes } from '@/routeTree.gen.ts';

type InternalLink = Exclude<FileRouteTypes['to'], ''>;

type ExternalLink = `http${'s' | ''}://${string}`;

type AnchorLink = `#${string}`;

type ValidLink = InternalLink | ExternalLink | AnchorLink;

type LinkProps<To extends ValidLink> = (To extends InternalLink
  ? LinkComponentProps<'a', RegisteredRouter, string, To>
  : React.ComponentProps<'a'>) & {
  to: To;
};

function Link<To extends ValidLink>(props: LinkProps<To>) {
  switch (true) {
    case isInternalLinkProps(props): {
      return <RouterLink {...props} />;
    }

    case isExternalLinkProps(props): {
      return (
        <a href={props.to} rel="noopener noreferrer" target="_blank" {...props}>
          {props.children}
        </a>
      );
    }

    case isAnchorLinkProps(props): {
      return (
        <a href={props.to} {...props}>
          {props.children}
        </a>
      );
    }

    default: {
      throw new Error(`Invalid link type: ${props.to}`);
    }
  }
}

function isInternalLink(link: string): link is InternalLink {
  return link.startsWith('/');
}

function isExternalLink(link: string): link is ExternalLink {
  return link.startsWith('http');
}

function isAnchorLink(link: string): link is AnchorLink {
  return link.startsWith('#');
}

function isInternalLinkProps(props: LinkProps<ValidLink>): props is LinkProps<InternalLink> {
  return isInternalLink(props.to);
}

function isExternalLinkProps(props: LinkProps<ValidLink>): props is LinkProps<ExternalLink> {
  return isExternalLink(props.to);
}

function isAnchorLinkProps(props: LinkProps<ValidLink>): props is LinkProps<AnchorLink> {
  return isAnchorLink(props.to);
}

export { Link };
export { isAnchorLink, isExternalLink, isInternalLink };
export type { AnchorLink, ExternalLink, InternalLink, ValidLink };
