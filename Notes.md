# Application need some parameters for constructor
```
//now we can define our stage for app and renderer
//if nothing can be provided as renderer ,app will create a renderer auto
import {WebglRenderer , Container,Application} from"./pixi";
const webglRenderer = new WebglRenderer();
const stage = new Container();
const app = new Application({stage,webglRenderer,{width:500,height:500}});
await app.init();
```
# Add some code error logs for webgpu 
now if something is wrong in webgpu system,there will be some error or warings in console