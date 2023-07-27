import { useEffect, useState } from 'react'
import * as ti from "../node_modules/taichi.js/dist/taichi"
import './App.css'

export const pad = (num: number, size: number, reverseSize?: number) => {
  num = reverseSize ? reverseSize - num : num
  const s = "000000000" + num;
  return s.substr(s.length - size);
}

const loadImage = (path: string) => {
  return new Promise<HTMLImageElement>(r => {
    const img = new Image()
    img.src = path;
    img.onload = () => {
      r(img);
    }
  })
}


const engine = async () => {
  const s = {

  }

  await ti.init();

  // const n = 1000
  // const pixels = ti.Vector.field(4, ti.f32, [2 * n, n]);

  const texs = await Promise.all(Array.from({ length: 40 }).map(async (_, i) => {
    const img = await loadImage(`./pic/${pad(i, 4)}.jpg`);
    const tex = await ti.Texture.createFromHtmlImage(img);
    return tex;
  }))


  let vertices = ti.field(ti.types.vector(ti.f32, 2), [6]);
  await vertices.fromArray([
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]);

  const canv = document.getElementById('canv') as HTMLCanvasElement;
  let renderTarget = ti.canvasTexture(canv);
    ti.addToKernelScope({ vertices, renderTarget, tex : texs});

  let render = ti.kernel(() => {
    ti.clearColor(renderTarget, [0.0, 0.5, 0.0, 1.0]);
    for (let v of ti.inputVertices(vertices)) {
      let zeroToOne = v;

      let zeroToTwo = zeroToOne * 2.0;

      let clipSpace = zeroToTwo - 1.0;
      //@ts-ignore
      let chien = clipSpace * [1.0, -1.0];
      //@ts-ignore
      ti.outputPosition([chien[0], chien[1], 0, 1]);
      ti.outputVertex(v);
    }
    //@ts-ignore
    for (let f of ti.inputFragments()) {
      //@ts-ignore
      let chien = vertices[0];
      //@ts-ignore
      let texel = ti.textureSample(tex[0], f);
      //@ts-ignore
      ti.outputColor(renderTarget, texel);
    }
  });

  // for (let i = 0; i < 100; i++) {
  // chien = texs[35];
  await render()
  // await new Promise(r => requestAnimationFrame(r));
  // }

  // canvas.setImage(pixels)

  return {
    s,
  }
}

function App() {

  useEffect(() => {
    ; (async () => {
      console.log("start");
      const eng = await engine()

    })()
  }, [])

  return (
    <>
      <canvas id="canv" width="1920" height="1080" style={{
        width: "50vw",
        height: "50vh",
      }}></canvas>

      <div className='spinner rotate' style={{
        position: "absolute",
        width: "100px",
        height: "100px",
        background: "red",
        top: "100px",
      }}>
      </div>

    </>
  )
}

export default App
