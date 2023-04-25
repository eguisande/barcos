sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ndc/BarcodeScanner",
	"com/argenovaembarco/helper/barcodescanner"
], function(Controller, scan, barcodescanner ) {
	"use strict";

	return Controller.extend("com.argenovaembarco.controller.App", {
	    onInit: function() {
	        this.getOwnerComponent().getModel("oFormData").setProperty("/selectShip", false);
	    
	    },
	    onSelectShip: function(oEvent) {
	        if(oEvent.getSource().getValue()) {
	            this.getOwnerComponent().getModel("oFormData").setProperty("/selectShip", true);
	        }else {
	            this.getOwnerComponent().getModel("oFormData").setProperty("/selectShip", false);
	        }
	    },
	    
	    onScan: function() {
	 
			barcodescanner.onScan(this);
	    }

	});
});