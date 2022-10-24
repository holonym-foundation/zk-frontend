import { WithCheckMark } from "./checkmark"

export const Step = ({complete, current, title, children}) => {
  const t = <h2>{title}</h2>
  return <div style={{marginBottom: complete ? '0px' : '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
  { complete ? 
    <WithCheckMark size={2}>{t}</WithCheckMark> 
      :
    <>{t} {current ? children : null}</>
  }
</div>
}