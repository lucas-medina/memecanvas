// Build app like you normally would;
const App = (() => {
    
    const $canvasWrapper = document.querySelector('.canvaswrapper');
    const $app = document.querySelector('.app');

	const canvas = new fabric.Canvas('memeGenerator');
	let canvasCurrentObject;
	let stickersObject;

	const app = {
		init(){
			Canvas.setCanvas();
			app.bind();
		},
		bind(){
			canvas.on('object:selected', (fabricEvent) => {
				Canvas.assignSelected(fabricEvent.target);
			});
			document.querySelector('.canvas-action__fileinput').addEventListener('change', Canvas.getBaseImage);
			
			document.querySelector('[ui-control-upload]').addEventListener('click', UIControls.upload);
			document.querySelector('[ui-control-expand]').addEventListener('click', UIControls.expand);
			document.querySelector('[ui-control-centerv]').addEventListener('click', UIControls.centerV);
			document.querySelector('[ui-control-centerh]').addEventListener('click', UIControls.centerH);
			document.querySelector('[ui-control-sticker]').addEventListener('click', UIControls.handleStickers);

			document.querySelector('.stickers').addEventListener('click', Stickers.addSticker);
		}
	}

	const Canvas = {
		setCanvas(){
			canvas.setWidth($canvasWrapper.clientWidth);
			canvas.setHeight($canvasWrapper.clientHeight);

			canvas.selectionColor = '#3498db';
			canvas.selectionBorderColor = '#34495e';
  			canvas.selectionLineWidth = 5;
  			canvas.preserveObjectStacking = true;

			fabric.Object.prototype.transparentCorners = false;
			fabric.Object.prototype.borderColor = '#555';
			fabric.Object.prototype.cornerColor = '#f2f2f2';
			fabric.Object.prototype.cornerStyle = 'circle';
			fabric.Object.prototype.centeredRotation = true;
			fabric.Object.prototype.lockUniScaling = true;
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
						hasControls: true,
						selectable: true,
						lockUniScaling: true,
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

					// CHANGE THIS LATER!
					canvas.renderAll();

					canvas.forEachObject((obj) => {
						var setCoords = obj.setCoords.bind(obj);
						obj.on({
							moving: setCoords,
							scaling: setCoords,
							rotating: setCoords
						});
				    });
				});

				$app.classList.add('has-input');

			}

			canvas.clear();
			reader.readAsDataURL(file);

		},

		drawStickerToCanvas(imageNode){
			let sticker = new fabric.Image(imageNode, {
				left: 50,
				top: 50
			});

			sticker.scaleToWidth(canvas.width/4);

			canvas.add(sticker).setActiveObject(sticker);
		},
		assignSelected(object){
			canvasCurrentObject = object;
		}
	}

	const UIControls = {
		upload(){
			document.querySelector('.canvas-action__fileinput').click();
		},
		expand(){
			if (canvasCurrentObject.width > canvasCurrentObject.height){
				canvasCurrentObject.scaleToHeight(canvas.height);
			} else {
				canvasCurrentObject.scaleToWidth(canvas.width);
			}

			canvasCurrentObject.center();
		},
		centerH(){
			canvasCurrentObject.centerH().setCoords();
		},
		centerV(){
			canvasCurrentObject.centerV().setCoords();
		},
		handleStickers(){
			let $parent = this.parentNode;
			$parent.classList.toggle('showing-stickers');

			if ($parent.classList.contains('showing-stickers')){
				Stickers.fetchStickers();	
			}
		}
	}

	const Stickers = {
		fetchStickers(){
			// if sticker list not set, set then list action
			if (!stickersObject){
				fetch('/dist/assets/json/images.json').then((response) => {
					return response.json();
				}).then((obj) => {
					stickersObject = obj;
					Stickers.listStickers();
				});
			}
		},
		listStickers(){
			// settings elem and list
			let stickers = stickersObject.stickers;
			let stickerWrapper = document.querySelector('.stickers__wrapper');
			let isStickersReady = false;

			// Loop the stickers list
			stickers.map((item, index) => {
				// define item elem

				let stickerItem = document.createElement('div');
				stickerItem.className = "stickers__item";
				stickerItem.setAttribute('data-info', item.name);

				// thumb elem
				let stickerItemThumb = document.createElement('img');
				stickerItemThumb.className = "stickers__itemthumb";
				stickerItemThumb.src = `/dist/assets/images/${item.source}`;

				// add thumb to item and write
				stickerItem.appendChild(stickerItemThumb);
				stickerItemThumb.onload = () => {
					console.log('image loaded');
					if (!isStickersReady){
						isStickersReady = true;
						stickerWrapper.classList.remove('loading');
						stickerWrapper.innerHTML = '';
					}
					stickerWrapper.appendChild(stickerItem);
				}
			});
		},
		addSticker(event){
			let $elem = event.target.closest('.stickers__item');
			if ($elem !== null){
				let imageNode = $elem.querySelector('img');
				Canvas.drawStickerToCanvas(imageNode);
			}
		}
	}

	return {
		init : app.init
	}

})();

App.init();