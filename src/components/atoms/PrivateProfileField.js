import classNames from 'classnames';
import CircleWavy from '../../img/CircleWavy.svg';
import CircleWavyCheck from '../../img/CircleWavyCheck.svg';


export default function PrivateProfileField({ 
  header, 
  fieldValue,
  verifyButtonCallback,
}) {

  const fieldValueClasses = classNames({
    'dash-display-text': true,
    'small': true,
    'disable': !fieldValue
  })

  return (
    <div className="x-card blue-yellow">
      <div className="card-heading">
        <h3 className="h3 no-margin">{header}</h3>
        <div className="card-status-div">
          {fieldValue ? (
              <img src={CircleWavyCheck} loading="lazy" alt="" className="card-status"/>
            ) : (
              <img src={CircleWavy} loading="lazy" alt="" className="card-status"/>
          )}
        </div>
        {verifyButtonCallback ? (
          <>
            <div onClick={verifyButtonCallback}>
              <h3 onClick={verifyButtonCallback} className="h3 no-margin dash">Verify</h3>
            </div>
          </>
        ) : null}
      </div>
      <h1 id="w-node-_7f02612f-b14d-3942-4118-0e889bc47c68-22284be6" className={fieldValueClasses}>
        {fieldValue ? fieldValue : 'N/A'}
      </h1>
    </div>
  );
};