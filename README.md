# adapt-flipcard-audio

**Flip card** is a *presentation component* for the [Adapt framework](https://github.com/adaptlearning/adapt_framework).  

The component generates cards with an image on the front face and text on the back face.  

## Installation

**Flip card** must be manually installed in the adapt framework and authoring tool.

If **Flip card** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).  

## Settings Overview

The attributes listed below are used in *components.json* to configure **Flip card**, and are properly formatted as JSON in [*example.json*](https://github.com/deltanet/adapt-flipcard-audio/blob/master/example.json).

### Attributes

[**core model attributes**](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes): These are inherited by every Adapt component. [Read more](https://github.com/adaptlearning/adapt_framework/wiki/Core-model-attributes).

**_component** (string): This value must be: `flipcard-audio`.

**_classes** (string): CSS class name to be applied to **Flip card**’s containing div. The class must be predefined in one of the Less files. Separate multiple classes with a space. A predefined CSS class can be applied to an Accordion Item.

**_layout** (string): This defines the horizontal position of the component in the block. Acceptable values are `full`, `left` or `right`.  

**instruction** (string): This optional text appears above the component. It is frequently used to guide the learner’s interaction with the component.  

**_flipType** (string): This specifies whether all items animate or just the item selected. Acceptable values are `singleFlip` or `allFlip`.  

**_flipTime** (number): This specifies the animation duration of the item.  

**_inRow** (number): This specifies the number of items displayed in a row.  

**_items** (array): Multiple items may be created. Each _item contains values for **frontImage**, **backTitle**, **backTitleReduced**, **backBody**, **backBodyReduced**, and **_audio**.  

>**frontImage** (string): File name (including path) of the image. Path should be relative to the *src* folder.  

>**backTitle** (string): This text is displayed as the item's title.  

>**backTitleReduced** (string): This text is displayed as the item's reduced title text if audio and reduced text are enabled.  

>**backBody** (string): This text is displayed as the item's body text.  

>**backBodyReduced** (string): This text is displayed as the item's reduced body text if audio and reduced text are enabled.  

>**_audio** (object): Items can have audio if it is enabled. It contains values for **src**.  

>>**src** (string): File name (including path) of the audio clip.  

## Limitations

No known limitations.  

----------------------------
**Version number:**  2.0.15  
**Framework versions:** 2+  
**Author / maintainer:** Deltanet with [contributors](https://github.com/deltanet/adapt-flipcard-audio/graphs/contributors)  
**Accessibility support:** yes   
**RTL support:** yes   
**Authoring tool support:** yes  
