// Build app like you normally would;
const App = (() => {
    
    const $canvasWrapper = document.querySelector('.canvaswrapper');
    const $app = document.querySelector('.app');

	const canvas = new fabric.Canvas('memeGenerator');

	const app = {
		init(){
			Canvas.setCanvas();
			app.bind();
		},
		bind(){
			document.querySelector('.canvas-action__fileinput').addEventListener('change', Canvas.getBaseImage);
			
			document.querySelector('[ui-control-upload]').addEventListener('click', UIControls.upload);
			document.querySelector('[ui-control-expand]').addEventListener('click', UIControls.expand);
			document.querySelector('[ui-control-centerv]').addEventListener('click', UIControls.centerV);
			document.querySelector('[ui-control-centerh]').addEventListener('click', UIControls.centerH);
		}
	}

	const Canvas = {
		setCanvas(){
			canvas.setWidth($canvasWrapper.clientWidth);
			canvas.setHeight($canvasWrapper.clientHeight);

			canvas.selectionColor = '#3498db';
			canvas.selectionBorderColor = '#34495e';
  			canvas.selectionLineWidth = 5;

			fabric.Object.prototype.transparentCorners = false;
		},
		getBaseImage(event){
			if (event.target.files.length == 0){
				// No file was sent, ok
				return false;
			}
			
			const file = event.target.files[0];
			const reader = new FileReader();

			if (file.type.indexOf('image/') == -1){
				// Not an image
				return false;				
			}

			reader.onload = (read) => {
				let data = read.target.result;
				
				fabric.Image.fromURL(data, (img) => {

					// Setting target rendering
					let target = img.set({
						transparentCorners: false,
						cornerStyle: 'circle',
						cornerColor: '#3498db',
						hasControls: true,
						selectable: true,
						lockUniScaling: true,
						centeredScaling: true,
						centeredRotation: true
					});

					// Scaling according to content
					if (target.height >= target.width){
						target.scaleToHeight(canvas.height);
					} else {
						target.scaleToWidth(canvas.width);
					}

					// Adding and centering to canvas
					canvas.add(target).setActiveObject(target);
					target.center();

					// target.setCoords();
					canvas.renderAll();

					canvas.forEachObject(function(obj) {
						var setCoords = obj.setCoords.bind(obj);
						obj.on({
							moving: setCoords,
							scaling: setCoords,
							rotating: setCoords
						});
				    })
				});

				$app.classList.add('has-input');

			}

			canvas.clear();
			reader.readAsDataURL(file);

		}
	}

	const UIControls = {
		upload(){
			document.querySelector('.canvas-action__fileinput').click();
		},
		expand(){
			console.log('works');
			
			let image = canvas.getObjects()[0];
			if (image.width > image.height){
				image.scaleToHeight(canvas.height);
			} else {
				image.scaleToWidth(canvas.width);
			}

			image.center();
		},
		centerH(){
			let image = canvas.getObjects()[0];
			image.centerH().setCoords();
		},
		centerV(){
			let image = canvas.getObjects()[0];
			image.centerV().setCoords();
		}
	}

	return {
		init : app.init
	}

})();

App.init();