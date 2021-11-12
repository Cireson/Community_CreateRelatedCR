// Create Related CR
//loadScript("/CustomSpace/CreateRelatedCR/CreateRelatedCR.js",['/View/','/Page/']);

/* Create Related CR Tasks */
app.custom.formTasks.add('ServiceRequest', "Create Related CR", function (formObj, viewModel) {
	CreateRelatedCR();
});
app.custom.formTasks.add('Incident', "Create Related CR", function (formObj, viewModel) {
	CreateRelatedCR();
});

/*Create Related CR Function */
function CreateRelatedCR () {
    //Class Id for CR
    var classid = "e6c9cf6e-d7fe-1b5d-216c-c3f5d2c7670c";
    //Call the Get Templates Web Service to return all CR Templates
    $.ajax({
        url: "/api/V3/Template/GetTemplates",
        data: {classId: classid},
        type: "GET",
        success: function (data) {
            //console.log (data)
            //Call the loadTemplates Function and send it the CR Template Names and Id's
            loadTemplates(data);
        }
    });

    function loadTemplates (templateData){
        //use requirejs to load the HTML template first
        require(["text!/CustomSpace/CreateRelatedCR/CreateRelatedCR.Template.html"], 
            function (htmlTemplate) {
                //make a jQuery obj
                templateObj = $(htmlTemplate);

                //create a view model to handle the UX
                var _vmWindow = new kendo.observable({
                    dropDownData: templateData,
                    valueChanged : function(e) {
                        var dataItem = e.sender.dataItem();
                        //console.log (dataItem.Id)
                    },
                    okClick: function () {
                        var templateId = $("#templateselected option:selected").val();
                        //console.log(templateId);
                        //They clicked OK now call the Create CR function and send the Template ID that is selected
                        createChangeRequest(templateId, pageForm.viewModel);
                        customWindow.close();
                    },
                    cancelClick: function () {
                        customWindow.close();

                    }
                });
             
                //create the kendo window
                customWindow = templateObj.kendoWindow({
                    title: "Create Related CR",
                    resizable: false,
                    modal: true,
                    viewable: false,
                    width: 500,
                    height: 300,
                    close: function () {
             
                    },
                    activate: function () {
                        //on window activate bind the view model to the loaded template content
                        kendo.bind(templateObj, _vmWindow);
                    }
                }).data("kendoWindow");
             
                //now open the window
                customWindow.open().center();
            }
        );
    }
    function createChangeRequest (templateId, viewModel) {
		//Logged in User Id
        var uid = session.user.Id;
        //console.log(uid);
        $.ajax({
            url: "/api/V3/Projection/CreateProjectionByTemplate",
            data: {
                id: templateId,
                createdById: uid
            },
            type: "GET",
            success: function (data) {
                //console.log(data);
                data.RelatesToWorkItem = [{
                    ClassTypeId: viewModel.ClassTypeId,
                    BaseId: viewModel.BaseId,
                    Id: viewModel.Id
                }];
                                              
                //console.log (data)
                var CRId = data.Id;
                var strData = {
                    "formJson": {
                        "current": data
                    }
                };
                $.ajax({
                    url: "/api/V3/Projection/Commit",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(strData) ,
                    success: function (result) {
						window.location.href = "/ChangeRequest/Edit/" + CRId
                    }
                });                                 
            }
        });
    };

}
