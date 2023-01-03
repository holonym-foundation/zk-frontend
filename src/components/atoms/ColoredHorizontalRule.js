export default function ColoredHorizontalRule({ color = "#5e72eb", leftRightFade = true }) {
  return (
    <div style={{ 
      margin: '10px', 
      padding: 'px', 
      border: 0, 
      height: "2px", 
      backgroundImage: `linear-gradient(to right, ${color}, ${leftRightFade ? "transparent" : color})` 
    }}></div>
  )
}
