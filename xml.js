'use strict';

if ("undefined" == typeof autopulous) var autopulous = {};
if ("undefined" == typeof autopulous.xml) autopulous.xml = {};

autopulous.xml.namespaceSeparator = ':';

autopulous.xml.nodeTypes = {
    ELEMENT: 1,
    ATTRIBUTE: 2,
    TEXT: 3,
    CDATA_SECTION: 4,
    ENTITY_REFERENCE: 5,
    ENTITY : 6,
    PROCESSING_INSTRUCTION: 7,
    COMMENT: 8,
    DOCUMENT: 9,
    DOCUMENT_TYPE: 10,
    DOCUMENT_FRAGMENT: 11,
    NOTATION: 12
};

autopulous.xml.nodeTypeKeys = Object.keys(autopulous.xml.nodeTypes);
autopulous.xml.nodeTypeKeys.unshift(undefined);

autopulous.xml.nodeTypeNames = [
    undefined,
    "Element",
    "Attribute",
    "Text",
    "CDATA Section",
    "Entity Reference",
    "Entity",
    "Processing Instruction",
    "Comment",
    "Document",
    "Document Type",
    "Document Fragment",
    "Notation"
];

autopulous.xml.isNodeType = function (nodeType) {
    return undefined != autopulous.xml.nodeTypeKeys[nodeType];
};

autopulous.xml.isNodeTypeKey = function (nodeTypeKey) {
    return undefined != autopulous.xml.nodeTypes[nodeTypeKey];
};

autopulous.xml.nodeType = function (nodeTypeKey) {
    return autopulous.xml.nodeTypes[nodeTypeKey];
};

autopulous.xml.nodeTypeKey = function (nodeType) {
    return autopulous.xml.nodeTypeKeys[nodeType];
};

autopulous.xml.nodeTypeName = function (nodeType) {
    return autopulous.xml.nodeTypeNames[nodeType];
};
