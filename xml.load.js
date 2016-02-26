autopulous.xml.handler = {};

autopulous.xml.load = function (url) {
    var retrieveNodeArguments = Array.prototype.slice.call(arguments);
    retrieveNodeArguments.shift();

    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = onReadyStateChangeHandler;

    xmlHttp.open("GET", url, true);
    xmlHttp.send();

    function onReadyStateChangeHandler() {
        if (4 == xmlHttp.readyState) {
            var rootNode;

            if (200 != xmlHttp.status) {
                rootNode = null;
            }
            else {
                autopulous.xml.cleanNodes(xmlHttp.responseXML);

                retrieveNodeArguments.unshift(xmlHttp.responseXML);

                rootNode = autopulous.xml.retrieveNode.apply(autopulous.xml, retrieveNodeArguments);

                autopulous.xml.handler.prototypeExtender = function (node) {
                    Object.defineProperties(node, {
                        "parent": {
                            get: function () {
                                return autopulous.xml.getParent(this);
                            }
                        },
                        "hasMultipleInstances": {
                            get: function () {
                                return autopulous.xml.hasMultipleInstances(this);
                            }
                        },
                        "instanceCount": {
                            get: function () {
                                return autopulous.xml.getInstanceCount(this);
                            }
                        },
                        "instanceOrdinal": {
                            get: function () {
                                return autopulous.xml.getInstanceOrdinal(this);
                            }
                        },
                        "isTextualNodeType": {
                            get: function () {
                                return autopulous.xml.isTextualNodeType(this);
                            }
                        },
                        "value": {
                            get: function () {
                                return autopulous.xml.getValue(this);
                            }
                        }
                    });

                    node.retrieveNode = function () {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(node);
                        return autopulous.xml.retrieveNode.apply(autopulous.xml, args);
                    };

                    node.retrieveText = function () {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(node);
                        return autopulous.xml.retrieveText.apply(autopulous.xml, args);
                    };

                    node.getInstanceCount = function () {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(node);
                        return autopulous.xml.getInstanceCount(autopulous.xml.retrieveNode.apply(autopulous.xml, args));
                    };

                    node.getInstanceOrdinal = function () {
                        var args = Array.prototype.slice.call(arguments);
                        args.unshift(node);
                        return autopulous.xml.getInstanceOrdinal(autopulous.xml.retrieveNode.apply(autopulous.xml, args));
                    };
                };

                autopulous.xml.processNodes(autopulous.xml.handler, rootNode);
            }

            var result = {};

            result.xmlHttpStatus = xmlHttp.status;
            result.response = xmlHttp.responseXML;
            result.rootNode = rootNode;

            if (null != autopulous.xml.handler.result) autopulous.xml.handler.result(result);
        }
    }
};

autopulous.xml.isTextualNodeType = function (node) {
    return null == node ? false : autopulous.xml.nodeTypes.TEXT == node.nodeType || autopulous.xml.nodeTypes.ATTRIBUTE == node.nodeType;
};

autopulous.xml.getValue = function (node) {
    return autopulous.xml.isTextualNodeType(node) ? node.nodeValue : null;
};

autopulous.xml.getParent = function (node) {
    return null == node ? null : autopulous.xml.nodeTypes.ATTRIBUTE == node.nodeType ? node._parentNode : node.parentNode;
};

autopulous.xml.getInstanceOrdinal = function (node) {
    if (null != node) {
        var parentNode = node.parentNode;

        if (null != parentNode) {
            var nodeName = node.nodeName;
            var childNodeCount = parentNode.childNodes.length;

            for (var instanceIndex = 0, childIndex = 0; childNodeCount > childIndex; childIndex++) {
                var childNode = parentNode.childNodes[childIndex];

                if (node === childNode) return instanceIndex + 1;
                if (nodeName == childNode.nodeName) instanceIndex++;
            }
        }
    }

    return null;
};

autopulous.xml.getInstanceCount = function (node) {
    var instanceCount = 0;

    if (null != node) {
        var parentNode = node.parentNode;

        if (null != parentNode) {
            var nodeName = node.nodeName;
            var childNodeCount = parentNode.childNodes.length;

            for (var childIndex = 0; childNodeCount > childIndex; childIndex++) {
                var childNode = parentNode.childNodes[childIndex];

                if (nodeName == childNode.nodeName) instanceCount++;
            }
        }
    }

    return instanceCount;
};

autopulous.xml.hasMultipleInstances = function (node) {
    return 1 < autopulous.xml.getInstanceCount(node);
};

autopulous.xml.retrieveNode = function () {
    var node = arguments[0];

    if (null == node) return null;

    for (var argumentIndex = 1; arguments.length > argumentIndex; argumentIndex++) {
        var soughtTagName = arguments[argumentIndex].trim();

        if ("@" == soughtTagName.charAt(0)) {
            if (arguments.length - 1 == argumentIndex && null != node.attributes) {
                soughtTagName = soughtTagName.slice(1);

                var attributeNodes = node.attributes;

                for (var attributeIndex = 0; attributeNodes.length > attributeIndex; attributeIndex++) {
                    node = attributeNodes.item(attributeIndex);

                    if (soughtTagName == node.nodeName) return node;
                }
            }

            return null;
        }

        var soughtInstance = arguments[argumentIndex + 1];

        if (!isNaN(soughtInstance)) {
            argumentIndex++;
        }
        else {
            soughtInstance = 1;
        }

        var foundInstance = 1;

        for (node = node.firstChild; ; node = node.nextSibling) {
            if (null == node) return null;
            if ((soughtTagName == node.localName || soughtTagName == node.nodeName) && soughtInstance == foundInstance++) break;
        }
    }

    return node;
};

autopulous.xml.retrieveText = function () {
    var args = Array.prototype.slice.call(arguments);

    var lastArg = args[args.length - 1];

    if ("number" == typeof lastArg || "@" != lastArg.charAt(0)) {
        args.push("#text");
    }

    var node = autopulous.xml.retrieveNode.apply(this, args);
    return null == node ? null : node.nodeValue;
};

autopulous.xml.cleanNodes = function (node) {
    for (var n = 0; n < node.childNodes.length; n++) {
        var childNode = node.childNodes[n];
        if (autopulous.xml.nodeTypes.COMMENT == childNode.nodeType || (autopulous.xml.nodeTypes.TEXT == childNode.nodeType && !/\S/.test(childNode.nodeValue))) {
            node.removeChild(childNode);
            n--;
        }
        else if (autopulous.xml.nodeTypes.ELEMENT == childNode.nodeType) {
            autopulous.xml.cleanNodes(childNode);
        }
    }
};

autopulous.xml.processNodes = function (handler, node) {
    if (null == node) return;

    if (null != handler.prototypeExtender) handler.prototypeExtender(node);

    if (null != handler.node) handler.node(node);

    switch (node.nodeType) {
        case autopulous.xml.nodeTypes.ELEMENT:
            if (null != handler.element) handler.element(node);
            break;
        case autopulous.xml.nodeTypes.ATTRIBUTE:
            if (null != handler.attribute) handler.attribute(node);
            break;
        case autopulous.xml.nodeTypes.TEXT:
            if (null != handler.text) handler.text(node);
            break;
        case autopulous.xml.nodeTypes.CDATA_SECTION:
            if (null != handler.cData) handler.cData(node);
            break;
        case autopulous.xml.nodeTypes.ENTITY_REFERENCE:
            if (null != handler.entityReference) handler.entityReference(node);
            break;
        case autopulous.xml.nodeTypes.ENTITY:
            if (null != handler.entity) handler.entity(node);
            break;
        case autopulous.xml.nodeTypes.PROCESSING_INSTRUCTION:
            if (null != handler.processingInstruction) handler.processingInstruction(node);
            break;
        case autopulous.xml.nodeTypes.COMMENT:
            if (null != handler.comment) handler.comment(node);
            break;
        case autopulous.xml.nodeTypes.DOCUMENT:
            if (null != handler.document) handler.document(node);
            break;
        case autopulous.xml.nodeTypes.DOCUMENT_TYPE:
            if (null != handler.documentType) handler.documentType(node);
            break;
        case autopulous.xml.nodeTypes.DOCUMENT_FRAGMENT:
            if (null != handler.documentFragment) handler.documentFragment(node);
            break;
        case autopulous.xml.nodeTypes.NOTATION:
            if (null != handler.notation) handler.notation(node);
            break;
        default:
            break;
    }

    if (autopulous.xml.nodeTypes.ELEMENT == node.nodeType) {
        processAttributeNodes(handler, node.attributes, node);
    }

    for (node = node.firstChild; null != node; node = node.nextSibling) {
        autopulous.xml.processNodes(handler, node);
    }

    function processAttributeNodes(handler, attributeNodes, parentNode) {
        if (null != attributeNodes) {
            for (var nodeIndex = 0; attributeNodes.length > nodeIndex; nodeIndex++) {
                var node = attributeNodes.item(nodeIndex);

                // adding an "artificial" parent property to attribute nodes because they "naturally"
                // do not know who their parent element is even though they do have a "natural" null
                // parentNode property (that we cannot assign).

                node._parentNode = parentNode;

                autopulous.xml.processNodes(handler, node);
            }
        }
    }
};