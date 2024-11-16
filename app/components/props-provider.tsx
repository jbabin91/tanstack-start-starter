import * as React from 'react';

type PropsProviderProps<ComponentOrProps> = React.PropsWithChildren<
  ComponentOrProps extends React.ComponentType
    ? React.ComponentProps<ComponentOrProps>
    : ComponentOrProps
>;

function PropsProvider<ComponentOrProps>({
  children,
  ...props
}: PropsProviderProps<ComponentOrProps>) {
  const newChildren = React.Children.map(children, (child) => {
    return React.isValidElement(child) ? React.cloneElement(child, props) : child;
  });

  return <>{newChildren}</>;
}

export { PropsProvider };
