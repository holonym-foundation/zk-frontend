const RoundedWindow = ({children}) => (
    <div style={{display: "flex", alignItems:"center", justifyContent: "center", flexDirection: "column"}}>
        <div style={{ backgroundColor: "var(--dark-card-background)", position: "absolute", paddingLeft: "5vw", paddingRight: "5vw", width:"80%", height:"80%", borderRadius: "100px", border: "1px solid white", display: "flex", justifyContent: "flex-start", flexDirection: "column", overflow: "auto" }}>
            {children}
        </div>
    </div>
)
export default RoundedWindow;