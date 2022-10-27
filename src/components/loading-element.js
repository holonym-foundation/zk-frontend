import { Oval } from "react-loader-spinner";

const LoadingElement = (props) => (
    <div className="App x-section wf-section bg-img">
        <div className="x-container nav w-container">
        <Oval
            height={100}
            width={100}
            color="white"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
            ariaLabel="oval-loading"
            secondaryColor="black"
            strokeWidth={2}
            strokeWidthSecondary={2}
      />
        </div>
    </div>
);
export default LoadingElement;