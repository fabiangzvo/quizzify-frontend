import Loader from "./components/Loader";

interface LoaderProps {
  isLoading: boolean;
  component: JSX.Element | Array<JSX.Element>;
}

function LoaderComponent(props: LoaderProps): JSX.Element {
  const { isLoading, component } = props;

  return isLoading ? <Loader /> : <>{component}</>;
}

export default LoaderComponent;
