import React, { FunctionComponent, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { makeStyles } from 'tss-react/mui';
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DropContainerComponent from './subcomponents/DropContainerComponent'
import EditPropertiesComponent from './subcomponents/EditPropertiesComponent'
import {
  isMobile as libIsMobile,
  isTablet as libIsTablet,
} from "react-device-detect";
import LeftSidebar from "./LeftSidebar";
import useFormBuilder from "./hooks/useFormBuilder";
import useFormPreview from './hooks/useFormPreview';
import { Publish, RemoveRedEye } from "@mui/icons-material";
import { FormContainerList, FormControlList, FormItemTypes } from "../../utils/formBuilderUtils";
import FormPreview from './subcomponents/FormPreview';
import { FormLayoutComponentChildrenType, FormLayoutComponentContainerType, FormLayoutComponentsType, TemplateType } from "../../types/FormTemplateTypes";
import { generateID } from "../../utils/common";
import ControlDragComponent from "./subcomponents/ControlDragComponent";
import { useNavigate } from "react-router-dom";

let isMobile: boolean;
if (process.env.NODE_ENV === "localhost") {
  isMobile = window.innerWidth < 1024;
} else {
  isMobile = libIsMobile || libIsTablet || window.innerWidth < 1024;
}

interface FormBuilderProps {
  template: TemplateType
}

const useStyles = makeStyles()(() => ({
  textField: {
    minWidth: "100%",
    maxWidth: "100%",
  },
  sidebarHeight: {
    height: "calc(100vh - 63px);",
    overflowY: "auto",
  },
}));  


const FormBuilder: FunctionComponent<FormBuilderProps> = (props) => {

  const {
    handleItemAdded,
    saveForm,
    deleteContainer,
    deleteControl,
    editContainerProperties,
    editControlProperties,
    moveControl,
    moveControlFromSide,
    publishForm,
    selectControl,
    selectedTemplate,
    formLayoutComponents,
    selectedControl,
  } = useFormBuilder({ template: props.template });


  const generatePreviewData = () => {
    console.log('form layout components', formLayoutComponents);
    const previewData: Record<string, any> = {};

    // All allowed properties
    const whitelistedProps = ['type', 'xs', 'label', 'keyValue', 'default'];

    const toCamelCase = (str: string): string => {
      return str
        .split(' ')
        .map((word, index) => {
          const lowerWord = word.toLowerCase();
          return index === 0 ? lowerWord : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        })
        .join('');
    };

    formLayoutComponents.forEach(layout => {
      layout.children.forEach(control => {
        if (!control.label || !control.type) return;

        // Create object with only whitelisted properties that exist in control
        const result = whitelistedProps.reduce((acc, prop) => {
          if (control[prop] !== undefined) {
            acc[prop] = control[prop];
          }
          return acc;
        }, {} as Record<string, any>);

        // Convert label to camelCase for the key
        const key = toCamelCase(control.label);
        
        // Add the key property to the result object
        result.key = key;
        
        previewData[key] = result;
      });
    });

    console.log('All Controls Preview Data:', previewData);
  };

  const { showPreview, openPreviewDrawer, closePreviewDrawer } =
    useFormPreview();

  const {classes} = useStyles();

  const navigate = useNavigate();

  return (
    <>
      {!isMobile ? (
        <>
          <DndProvider backend={HTML5Backend}>
            <div className="wrapper">
              <div className="row">
                <div
                  className={classes.sidebarHeight + " sidebar col-lg-2"}
                  style={{ paddingLeft: "30px !important" }}
                >
                  <div className="container">
                    <LeftSidebar handleItemAdded={handleItemAdded} formLayoutComponents={formLayoutComponents} />
                  </div>
                </div>
                <div className="col-lg-8">
                  <div className="container p-20 h-100">
                    {/* Form Details and Action */}
                    <div className="row mb-5">
                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-between">
                          <h4 className="mb-0">{selectedTemplate?.formName}</h4>
                          <div className="action-buttons d-flex">
                            <Button
                              onClick={() => {
                                navigate('/');
                              }}
                              className="mx-2"
                            >
                              Cancel
                            </Button>
                            <div className="border-right"></div>
                            <Button onClick={saveForm} className="mx-2">
                              Save
                            </Button>
                            <Button
                              className="mx-2"
                              variant="outlined"
                              onClick={() => {
                                generatePreviewData();
                                openPreviewDrawer();
                              }}
                              endIcon={<RemoveRedEye />}
                            >
                              Preview
                            </Button>
                            <Button
                              onClick={publishForm}
                              className="mx-2"
                              color="primary"
                              endIcon={<Publish />}
                              disableElevation
                              variant="contained"
                            >
                              Publish
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="p-20"
                      style={{
                        overflowY: "auto",
                        height: "calc(100vh - 180px)",
                      }}
                    >
                      <div className="row mb-5">
                        {formLayoutComponents.map((layout, ind) => {
                          return (
                            <DropContainerComponent
                              key={layout.container.id}
                              index={ind}
                              layout={layout.container}
                              selectedControl={selectedControl}
                              childrenComponents={layout.children}
                              deleteContainer={deleteContainer}
                              deleteControl={deleteControl}
                              selectControl={selectControl}
                              accept={FormItemTypes.CONTROL}
                              moveControl={moveControl}
                            />
                          );
                        })}
                      </div>
                      <div className="row mb-5">
                        <DropContainerComponent
                          accept={FormItemTypes.CONTAINER}
                          name={"Parent Component"}
                          handleItemAdded={handleItemAdded}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={classes.sidebarHeight + " sidebar col-lg-2"}>
                  <div className="container">
                    <EditPropertiesComponent
                      selectedControl={selectedControl}
                      selectControl={selectControl}
                      formLayoutComponents={formLayoutComponents}
                      moveControlFromSide={moveControlFromSide}
                      editContainerProperties={editContainerProperties}
                      editControlProperties={editControlProperties}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Preview Drawer */}
            <FormPreview
              screenType="mobile"
              showPreview={showPreview}
              formLayoutComponents={formLayoutComponents}
              closePreviewDrawer={closePreviewDrawer}
            />
          </DndProvider>
        </>
      ) : (
        <>
          <div className="wrapper mt-5">
            <p className="text-center">
              Form Builder is only supported on desktop devices for now. Please
              switch to a desktop device.
            </p>
          </div>
        </>
      )}
    </>
  );
};

export default FormBuilder;

