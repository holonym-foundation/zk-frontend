const CheckMark = ({size}) => <p style={{color:'#2fd87a', padding: '10px', fontSize: (size || 1) + 'em'}}>{'\u2713'}</p>
const WithCheckMark = ({size, children}) => <div style={{display: "flex",justifyContent: "center",alignItems: "center"}}>
  <CheckMark size={size} />
  {children}
</div>
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