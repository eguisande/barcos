sap.ui.define([], function () {
	"use strict";

	return {

		onScan: function (self) {
	
			if (!self._oScanDialog) {
				self._oScanDialog = new sap.m.Dialog({
					title: "Escanear código",
					contentWidth: "640px",
					contentHeight: "480px",
					horizontalScrolling: false,
					verticalScrolling: false,
					stretchOnPhone: true,
					content: [new sap.ui.core.HTML({
						id: self.createId("scanContainer"),
						content: "<div />"
					})],
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function (oEvent) {
							self._oScanDialog.close();
						}.bind(self)
					}),
					afterOpen: function () {
						this._initQuagga(self, self.getView().byId("scanContainer").getDomRef()).done(function () {
							// Initialisation done, start Quagga
							Quagga.start();
						}).fail(function (oError) {
							// Failed to initialise, show message and close dialog...self should not happen as we have
							// already checked for camera device ni /model/models.js and hidden the scan button if none detected
							sap.m.MessageToast.show(oError.message.length ? oError.message : ("Failed to initialise Quagga with reason code " + oError.name), {
								onClose: function () {
									self._oScanDialog.close();
								}.bind(this)
							});
						}.bind(this));
					}.bind(this),
					afterClose: function () {
						// Dialog closed, stop Quagga
						Quagga.stop();
					}
				});

				self.getView().addDependent(self._oScanDialog);
			}

			self._oScanDialog.open();
		},
		_initQuagga: function (self, oTarget) {
			var oDeferred = jQuery.Deferred();

			// Initialise Quagga plugin - see https://serratus.github.io/quaggaJS/#configobject for details
			Quagga.init({
				inputStream: {
					type: "LiveStream",
					target: oTarget,
					constraints: {
						width: {
							min: 640
						},
						height: {
							min: 480
						},
						facingMode: "environment"
					}
				},
				locator: {
					patchSize: "medium",
					halfSample: true
				},
				numOfWorkers: 2,
				frequency: 10,
				decoder: {
					readers: [{
						format: "code_128_reader",
						config: {}
					}]
				},
				locate: true
			}, function (error) {
				if (error) {
					oDeferred.reject(error);
				} else {
					oDeferred.resolve();
				}
			});

			if (!self._oQuaggaEventHandlersAttached) {
				// Attach event handlers...

				Quagga.onProcessed(function (result) {
					var drawingCtx = Quagga.canvas.ctx.overlay,
						drawingCanvas = Quagga.canvas.dom.overlay;

					if (result) {
						// The following will attempt to draw boxes around detected barcodes
						if (result.boxes) {
							drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
							result.boxes.filter(function (box) {
								return box !== result.box;
							}).forEach(function (box) {
								Quagga.ImageDebug.drawPath(box, {
									x: 0,
									y: 1
								}, drawingCtx, {
									color: "green",
									lineWidth: 2
								});
							});
						}

						if (result.box) {
							Quagga.ImageDebug.drawPath(result.box, {
								x: 0,
								y: 1
							}, drawingCtx, {
								color: "#00F",
								lineWidth: 2
							});
						}

						if (result.codeResult && result.codeResult.code) {
							Quagga.ImageDebug.drawPath(result.line, {
								x: 'x',
								y: 'y'
							}, drawingCtx, {
								color: 'red',
								lineWidth: 3
							});
						}
					}
				}.bind(self));

				Quagga.onDetected(function (result) {
					// Barcode has been detected, value will be in result.codeResult.code. If requierd, validations can be done 
					// on result.codeResult.code to ensure the correct format/type of barcode value has been picked up
					// Set barcode value in input field
			            debugger;
					if(this.getOwnerComponent().getModel("FilterModel").getProperty("/toScanEquipo") === true){
					sap.m.MessageToast.show("Equipo escaneado correctamente");
					this.getOwnerComponent().getModel("FilterModel").setProperty("/SelectedEquipment", result.codeResult.code);
					}else{
						sap.m.MessageToast.show("Ubicación escaneada correctamente");
					this.getOwnerComponent().getModel("FilterModel").setProperty("/SelectedFunctionalLoc", result.codeResult.code);
					}
					// Close dialog
					self._oScanDialog.close();
				}.bind(self));

				// Set flag so that event handlers are only attached once...
				self._oQuaggaEventHandlersAttached = true;
			}

			return oDeferred.promise();
		}

		

	};
});