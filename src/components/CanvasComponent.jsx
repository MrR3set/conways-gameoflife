import React from "react";
import p5 from "p5";

class CanvasComponent extends React.Component {
  constructor(props) {
    super(props)
    this.myRef = React.createRef()
    this.gridSize = this.props.size
    this.grid = this.props.preset.length>1?this.props.preset:this.Make2Darray()
    this.state={
      grid : this.Make2Darray()
    }
  }
  
  Make2Darray(){
    let grid = new Array(this.gridSize)
    for(let x=0;x<this.gridSize;x++){
      grid[x] = new Array(this.gridSize).fill(0)
    }
    return grid
  }

  checkNeighbours(x,y){
    let total = 0
    // Counts the elements surrounding the element
    for(let i=-1;i<=1;i++)
      for(let j=-1;j<=1;j++)
        total += this.state.grid[x-i][y-j]
    total -= this.state.grid[x][y] //Substract the current element as the loop counts it as well
    return total
  }

  Sketch = (p) => {
    let cellSize = this.props.width/this.gridSize
    p.setup = () => {
      p.createCanvas(this.props.width,this.props.width)

      if(this.props.preset.length>1){
        console.log("Using preset")
        this.state.grid = this.props.preset
      }else{

        //If not clickable or no preset
        this.state.grid.forEach((row,i)=>{
          row.forEach((col,j)=>{
            this.state.grid[i][j] = p.floor(p.random(2))
          })
        })
      }
    }

    p.draw = () => {
      p.background(0)
      //Draw cells
      console.log("Drawing cells")
      this.state.grid.forEach((row,i)=>{
        row.forEach((col,j)=>{
          if(this.state.grid[i][j] === 1){
            p.fill(255)
            p.rect(i*cellSize,j*cellSize,cellSize-1,cellSize-1)
          }
        })
      })
      // Check if stop button has been pressed - if so it will draw the previous canvas...
      if(this.props.isRunning || this.props.doNext){
        //Check next generation
        let nextGeneration = this.Make2Darray()
        //Neighbours chech
        this.state.grid.forEach((row,i)=>{
          row.forEach((col,j)=>{
            if (i===0||i===this.gridSize-1||j===0||j===this.gridSize-1){
              nextGeneration[i][j]=this.state.grid[i][j]
            }else{
              let neighbours = this.checkNeighbours(i,j)
              if(this.state.grid[i][j] === 0 && neighbours===3 )
                nextGeneration[i][j] = 1
              else if(this.state.grid[i][j] === 1 &&( neighbours<2 ||neighbours>3))
                nextGeneration[i][j]=0
              else
                nextGeneration[i][j]=this.state.grid[i][j]
            }
          })
        }) //End of neighbours check
        p.noLoop()
        if(JSON.stringify(nextGeneration)===JSON.stringify(this.state.grid)){
          console.log("Generation Ended")
          this.props.toggleRunning()
        }else{
          if(this.props.doNext){
            this.props.toggleNext()
          }
          setTimeout(()=>{
            this.setState({grid:nextGeneration})
            this.props.addGeneration()
            p.loop()
          },75)
        }
      }
    }
  }
  
  componentDidMount(){
    this.myP5 = new p5(this.Sketch,this.myRef.current)
  }

  render(){
    return (<div ref={this.myRef}></div>)
  }
}

export default CanvasComponent