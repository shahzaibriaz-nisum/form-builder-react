import React, { FC, useEffect, useState } from 'react'
import ManageItemsListComponent from './ManageItemsListComponent';
import { FormLayoutComponentChildrenType, FormLayoutComponentContainerType, FormLayoutCoponentChildrenItemsType } from '../../../types/FormTemplateTypes';
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { FormControlNames, FormItemTypes, ControlItemType } from '../../../utils/formBuilderUtils';
import { FormLayoutComponentsType } from '../../../types/FormTemplateTypes';
import _ from "lodash";
import useModalStrip from '../../../global-hooks/useModalStrip';

const textboxStyle={
  minWidth: "100%",
  maxWidth: "100%",
  marginTop: 10,
}

interface EditPropertiesComponentProps{
  selectedControl?:
    | undefined
    | FormLayoutComponentChildrenType
    | FormLayoutComponentContainerType;
  selectControl?: (layout: FormLayoutComponentChildrenType | FormLayoutComponentContainerType | undefined) => void;
  editControlProperties: (updatedItem: FormLayoutComponentChildrenType)=>void;
  editContainerProperties: (updatedItem: FormLayoutComponentContainerType)=>void;
  formLayoutComponents: FormLayoutComponentsType[];
  moveControlFromSide: (selectedControl: FormLayoutComponentChildrenType, moveControlObj: FormLayoutComponentChildrenType)=>void;
}

const EditPropertiesComponent: FC<EditPropertiesComponentProps> = (props)=> {
  
  const {selectedControl, selectControl, editControlProperties, editContainerProperties} = props;
  const [updatedItem, setUpdatedItem] = useState<FormLayoutComponentChildrenType | FormLayoutComponentContainerType| {}>({});
  
  const childUpdatedItem = updatedItem as FormLayoutComponentChildrenType;
  const containerUpdatedItem = updatedItem as FormLayoutComponentContainerType;
  
  const [isUpdatedItemRequired, setIsUpdatedItemRequired] = useState(false);

  const [moveControlObj, setMoveControlObj] = useState<FormLayoutComponentChildrenType | null>(null);
  const [controlsInContainer, setControlsInContainer] = useState<number | undefined>(undefined);

  const {showModalStrip} = useModalStrip();

  useEffect(()=>{
    if(selectedControl){
      if((selectedControl as FormLayoutComponentChildrenType).items){
        setUpdatedItem({
          ...selectedControl,
          items: JSON.parse(
            JSON.stringify(
              (selectedControl as FormLayoutComponentChildrenType).items
            )
          ),
        });
      } else{
        setUpdatedItem({...selectedControl});
      }
      if(selectedControl.hasOwnProperty('required')){
        setIsUpdatedItemRequired(
          (selectedControl as FormLayoutComponentChildrenType).required
        );
      }
    }
    setMoveControlObj(null);
    setControlsInContainer(undefined);
  },[selectedControl])
  
  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>  = (e)=>{
    const { name, value } = e.target;
    setUpdatedItem((prevState) => ({
      ...prevState, [name]: value 
    }));
  }


  const addItemInList = (item:FormLayoutCoponentChildrenItemsType)=>{
    const newItems = _.cloneDeep((updatedItem as FormLayoutComponentChildrenType).items);
    newItems.push(item);
    setUpdatedItem((prevState)=>({
      ...prevState, items: newItems
    }));
  }

  const deleteItemFromList = (item: FormLayoutCoponentChildrenItemsType)=>{
    const newItems = (updatedItem as FormLayoutComponentChildrenType).items?.filter((i)=>i.id !== item.id);
    setUpdatedItem((prevState)=>({
      ...prevState, items: newItems
    }));
  }

  const editIteminList = (item: FormLayoutCoponentChildrenItemsType)=>{
    const newItems: FormLayoutCoponentChildrenItemsType[] = _.cloneDeep((updatedItem as FormLayoutComponentChildrenType).items);
    const itemToBeReplaced = newItems.filter((i)=>i.id === item.id)[0];
    itemToBeReplaced.value = item.value;
    itemToBeReplaced.label = item.label;
    setUpdatedItem((prevState)=>({
      ...prevState, items: newItems
    }));
  }

  const handleCheckChange: React.ChangeEventHandler<HTMLInputElement> = (e)=>{
    const { name, value } = e.target;
    const key = e.currentTarget.checked;
    if(name === 'required'){
      setIsUpdatedItemRequired(key);
    }
    setUpdatedItem((prevState) => ({
      ...prevState, [name]: key 
    }));
  }

  const onFormSubmit: React.FormEventHandler<HTMLFormElement> = (event)=>{
    event.preventDefault();
    editControlProperties(updatedItem as FormLayoutComponentChildrenType);
  }

  const onContainerFormSubmit: React.FormEventHandler<HTMLFormElement> =(event)=>{
    event.preventDefault();
    editContainerProperties((updatedItem as FormLayoutComponentContainerType));
  }

  const handleMoveControlSelectChange: ((event: SelectChangeEvent<any>, child: React.ReactNode)=>void) = (e)=>{
    const {name,value}= e.target;

    if(name === 'containerId'){
      const container = props.formLayoutComponents.filter((con)=>con.container.id === value)[0];
      let stepsInContainer = container.children.length;
      if((selectedControl as FormLayoutComponentChildrenType).containerId === value){
        stepsInContainer -= 1;
      }
      
      setControlsInContainer(stepsInContainer);
    }
    setMoveControlObj((prev)=>({
      ...prev as FormLayoutComponentChildrenType,
      [name]:value
    }))
  }

  const getPositions = ()=>{
    if(controlsInContainer !== undefined){
      return Array.from(Array(controlsInContainer+1).keys()).map((item)=>{
        return <MenuItem key={item} value={item}>{item+1}</MenuItem>
      })
    }
    return null;
  }

  const onMoveControlFormSubmit: React.FormEventHandler<HTMLFormElement> = (e)=>{
    e.preventDefault();

    if(!(moveControlObj as FormLayoutComponentChildrenType).containerId){
      showModalStrip("danger","You need to select Step first",5000);
      return;
    }
    props.moveControlFromSide(selectedControl as FormLayoutComponentChildrenType,moveControlObj as FormLayoutComponentChildrenType);
  }

  return (
    <>
      {selectedControl ? (
        // FIXME: EDIT CONTAINER PROPERTIES
        <>
          {containerUpdatedItem.itemType === FormItemTypes.CONTAINER ? (
            <>
              <div className="main-form">
                <form
                  onSubmit={onContainerFormSubmit}
                  style={{ minWidth: "100%" }}
                >
                  <div className="main-form-title">
                    Edit Container Properties
                  </div>
                  <div>
                    <TextField
                      label="Container Heading"
                      name="heading"
                      value={containerUpdatedItem.heading}
                      onChange={handleChange}
                      style={textboxStyle}
                    />
                  </div>
                  <div>
                    <TextField
                      label="Container Sub-Heading"
                      name="subHeading"
                      value={containerUpdatedItem.subHeading}
                      onChange={handleChange}
                      style={textboxStyle}
                    />
                  </div>
                  <input
                    type="submit"
                    className="btn btn-light btn-shadow m-t-20 m-r-10"
                    value="Update Data"
                  />
                  <input
                    type="button"
                    className="btn btn-light btn-shadow m-t-20 m-l-0"
                    value="Cancel"
                    onClick={() => {
                      if (selectControl) {
                        selectControl(undefined);
                      }
                    }}
                  />
                </form>
              </div>
            </>
          ) : (
            <>
            {/* Edit Field Properties */}
              <div className="main-form">
                <form onSubmit={onFormSubmit} style={{ minWidth: "100%" }}>
                  <div className="main-form-title">Edit Field Properties</div>
                  {/* Common field for all types */}
                  <div>
                    <TextField
                      label="Size - XS"
                      name="xs"
                      type="number"
                      value={childUpdatedItem.xs || ''}
                      onChange={handleChange}
                      style={textboxStyle}
                      inputProps={{
                        max: 12,
                        min: 1
                      }}
                    />
                  </div>
                  <div>
                    <TextField
                      label="Type"
                      name="type"
                      value={childUpdatedItem.type || ''}
                      style={textboxStyle}
                      disabled
                    />
                  </div>

                  {/* Label field for all control types */}
                  <div>
                    <TextField
                      label="Field Label Name"
                      name="label"
                      value={childUpdatedItem.label || ''}
                      onChange={handleChange}
                      style={textboxStyle}
                      required
                    />
                  </div>

                  {/* Key Value field only for Label and Input types */}
                  {(childUpdatedItem.type === ControlItemType.LABEL || childUpdatedItem.type === ControlItemType.INPUT) && (
                    <div>
                      <TextField
                        label="Key Value"
                        name="keyValue"
                        value={childUpdatedItem.keyValue || ''}
                        onChange={handleChange}
                        style={textboxStyle}
                      />
                    </div>
                  )}

                  {/* Fields only for Input type */}
                  {childUpdatedItem.type === ControlItemType.INPUT && (
                    <>
                      <div>
                        <TextField
                          label="Default"
                          name="default"
                          value={childUpdatedItem.default || ''}
                          onChange={handleChange}
                          style={textboxStyle}
                        />
                      </div>
                    </>
                  )}
                  <div className="m-t-20 p-l-0">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isUpdatedItemRequired}
                          name="required"
                          onChange={handleCheckChange}
                        />
                      }
                      label="Required"
                    />
                  </div>
                  {childUpdatedItem.controlName === FormControlNames.RADIOGROUP ||
                  childUpdatedItem.controlName === FormControlNames.SELECTDROPDOWN ||
                  childUpdatedItem.controlName === FormControlNames.CHECKLIST ? (
                    <>
                      <h6>List Items</h6>
                      <ManageItemsListComponent
                        addItemInList={addItemInList}
                        editIteminList={editIteminList}
                        deleteItemFromList={deleteItemFromList}
                        items={childUpdatedItem.items}
                      />
                    </>
                  ) : null}
                  <input
                    type="submit"
                    className="btn btn-light btn-shadow m-t-20 m-r-10"
                    value="Update Data"
                  />
                  <input
                    type="button"
                    className="btn btn-light btn-shadow m-t-20 m-l-0"
                    value="Cancel"
                    onClick={() => {
                      if (selectControl) {
                        selectControl(undefined);
                      }
                    }}
                  />
                </form>
              </div>
              <div className="m-t-20"></div>
              <div className="main-form">
                <form
                  onSubmit={onMoveControlFormSubmit}
                  style={{ minWidth: "100%" }}
                >
                  <div className="main-form-title">Move Control to Step</div>
                  <div>
                    <FormControl style={{ minWidth: "100%" }}>
                      <InputLabel>Step:</InputLabel>
                      <Select
                        name="containerId"
                        value={
                          moveControlObj && moveControlObj.containerId
                            ? moveControlObj.containerId
                            : ""
                        }
                        onChange={handleMoveControlSelectChange}
                      >
                        {props.formLayoutComponents.map((item, ind) => {
                          return (
                            <MenuItem
                              key={item.container.id}
                              value={item.container.id}
                            >
                              Step {ind + 1}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </div>
                  <div>
                    <FormControl style={{ minWidth: "100%" }}>
                      <InputLabel>Position:</InputLabel>
                      <Select
                        name="position"
                        value={
                          moveControlObj && moveControlObj.position ? moveControlObj.position : ""
                        }
                        onChange={handleMoveControlSelectChange}
                      >
                        {getPositions()}
                      </Select>
                    </FormControl>
                  </div>
                  <input
                    type="submit"
                    className="btn btn-light btn-shadow m-t-20 m-r-10"
                    value="Move"
                  />
                  <input
                    type="button"
                    className="btn btn-light btn-shadow m-t-20 m-l-0"
                    value="Cancel"
                    onClick={() => {
                      if (selectControl) {
                        selectControl(undefined);
                      }
                    }}
                  />
                </form>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <h4>Edit Properties</h4>
          <div
            role="alert"
            className="m-t-30 alert alert-dark alert-dismissible"
          >
            <h4>Note!</h4>
            You need to select a container/control to edit properties.
          </div>
        </>
      )}
    </>
  );
}

export default EditPropertiesComponent;