'use strict';

var nodeTypeCount = 13;

var index, key, nodeType;

describe('xml.js unit test suite', function () {
    describe('node types', function () {
        it('should have ' + nodeTypeCount + ' members', function () {
            expect(autopulous.xml.nodeTypeKeys.length).toEqual(nodeTypeCount);
        });

        it('should have monotonically ascending member values', function () {
            for (nodeType = autopulous.xml.nodeTypes.ELEMENT; autopulous.xml.nodeTypes.NOTATION >= nodeType; nodeType++) {
                expect(nodeType).toEqual(autopulous.xml.nodeTypes[autopulous.xml.nodeTypeKeys[nodeType]]);
            }
        });

        it('should be verifiable by nodeType', function () {
            expect(false).toEqual(autopulous.xml.isNodeTypeKey(autopulous.xml.nodeTypeKey(-1)));

            for (nodeType = autopulous.xml.nodeTypes.ELEMENT; autopulous.xml.nodeTypes.NOTATION >= nodeType; nodeType++) {
                expect(true).toEqual(autopulous.xml.isNodeTypeKey(autopulous.xml.nodeTypeKey(nodeType)));
            }

            expect(false).toEqual(autopulous.xml.isNodeTypeKey(autopulous.xml.nodeTypeKey(autopulous.xml.nodeTypes.NOTATION + 1)));
        });

        it('should be verifiable by key', function () {
            expect(false).toEqual(autopulous.xml.isNodeTypeKey(autopulous.xml.nodeTypeKeys[0]));

            for (index = 1; autopulous.xml.nodeTypeKeys.length > index; index++) {
                expect(true).toEqual(autopulous.xml.isNodeTypeKey(autopulous.xml.nodeTypeKeys[index]));
            }
        });

        it('should be able to retrieve a key by nodeType', function () {
            for (nodeType = autopulous.xml.nodeTypes.ELEMENT; autopulous.xml.nodeTypes.NOTATION >= nodeType; nodeType++) {
                expect(nodeType).toEqual(autopulous.xml.nodeTypes[autopulous.xml.nodeTypeKey(nodeType)]);
            }
        });

        it('should be able to retrieve a nodeType by key', function () {
            nodeType = autopulous.xml.nodeTypes.ELEMENT;

            for (key in autopulous.xml.nodeTypes) {
                if (autopulous.xml.nodeTypes.hasOwnProperty(key)) {
                    expect(nodeType).toEqual(autopulous.xml.nodeTypes[key]);
                }
                nodeType++;
            }
        });

        it('should be able to retrieve a nodeType using a nodeType (reflexive)', function () {
            for (nodeType = autopulous.xml.nodeTypes.ELEMENT; autopulous.xml.nodeTypes.NOTATION >= nodeType; nodeType++) {
                expect(nodeType).toEqual(autopulous.xml.nodeType(autopulous.xml.nodeTypeKey(nodeType)));
            }
        });

        it('should be able to retrieve a the text description of a nodeType', function () {
            expect(undefined).toEqual(autopulous.xml.nodeTypeName(autopulous.xml.nodeTypes.ELEMENT - 1));
            expect("Element").toEqual(autopulous.xml.nodeTypeName(autopulous.xml.nodeTypes.ELEMENT));
            expect("Notation").toEqual(autopulous.xml.nodeTypeName(autopulous.xml.nodeTypes.NOTATION));
            expect(undefined).toEqual(autopulous.xml.nodeTypeName(autopulous.xml.nodeTypes.NOTATION + 1));
        });
    });
});

// http://jasmine.github.io/2.0/introduction.html#section-Asynchronous_Support

describe("XML load", function () {
    describe("#document from /base/test/resources/DoesNotExist.xml", function () {
        var url = "/base/test/resources/DoesNotExist.xml";
        var localName = "#document";
        var instance = 1;

        var xmlLoadResult;

        it("should NOT be found and therefore should NOT load", function loadXml(done) {
            autopulous.xml.handler.result = function (result) {
                xmlLoadResult = result;
                done(); // allows the function set by afterEach() and the follow on it() functions to process
            };

            autopulous.xml.load(url, localName, instance);
        });

        it("should have values that reflect 'file not found' in the result object", function () {
            expect(xmlLoadResult.xmlHttpStatus).toEqual(404);
            expect(xmlLoadResult.response).toEqual(null);
            expect(xmlLoadResult.rootNode).toEqual(null);
        });
    });

    describe("ns80:GetUserResponse[0] from /base/test/resources/GetUserResponse.xml", function () {
        var url = "/base/test/resources/GetUserResponse.xml";
        var localName = "GetUserResponse";

        var xmlLoadResult;

        it("should load", function loadXml(done) {
            autopulous.xml.handler.result = function (result) {
                xmlLoadResult = result;
                done(); // allows the function set by afterEach() and the follow on it() functions to process
            };

            autopulous.xml.load(url, "Envelope", "Body", localName);
        });

        it("should have values that reflect a successful file read and load in the result object", function () {
            expect(xmlLoadResult.xmlHttpStatus).toEqual(200);
            expect(xmlLoadResult.response.nodeName).toEqual("#document");
            expect(xmlLoadResult.rootNode.localName).toEqual(localName);
        });
    });

    describe("ns100:AddTransformationRuleResponse[0] from /base/test/resources/AddTransformationRuleResponse.xml", function () {
        var url = "/base/test/resources/AddTransformationRuleResponse.xml";
        var localName = "#document";

        var xmlLoadResult;

        it("should load", function loadXml(done) {
            autopulous.xml.handler.result = function (result) {
                xmlLoadResult = result;
                done(); // allows the function set by afterEach() and the follow on it() functions to process
            };

            autopulous.xml.load(url);
        });

        it("should have values that reflect a successful file read and load in the result object", function () {
            expect(xmlLoadResult.xmlHttpStatus).toEqual(200);
            expect(xmlLoadResult.response.nodeName).toEqual("#document");
            expect(xmlLoadResult.rootNode.nodeName).toEqual("#document");
        });
    });

    describe("/base/test/resources/GetUserResponse.xml", function () {
        var url = "/base/test/resources/GetUserResponse.xml";
        var localName = "#document";

        var xmlLoadResult;

        var documentRootNode = null;
        var messageRootNode = null;

        var documentTree = {};
        var elementTree = {};
        var attributeTree = {};
        var textTree = {};

        var bogusUnattachedNode;

        afterEach(function () { // set the function that will execute after the async test
            if (null != documentRootNode) return; // only need to process the XML response once (e.g. each it() will redundantly cause this function to be called)

            documentRootNode = xmlLoadResult.rootNode;

            var handler = {};

            handler.node = function (node) {
                expect(node).not.toBeNull();
            };

            handler.element = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.ELEMENT);

                var nodeKey = node.localName;

                if (null == elementTree[nodeKey]) elementTree[nodeKey] = [];

                elementTree[nodeKey].push(node);
            };

            handler.attribute = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.ATTRIBUTE);

                var nodeKey = node.localName;

                if (null == attributeTree[nodeKey]) attributeTree[nodeKey] = [];

                attributeTree[nodeKey].push(node);
            };

            handler.text = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.TEXT);

                var nodeKey = node.parentNode.localName;

                if (null == textTree[nodeKey]) textTree[nodeKey] = [];

                textTree[nodeKey].push(node);
            };

            handler.cData = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.CDATA_SECTION);
            };

            handler.entityReference = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.ENTITY_REFERENCE);
            };

            handler.processingInstruction = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.PROCESSING_INSTRUCTION);
            };

            handler.comment = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.COMMENT);
            };

            handler.document = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.DOCUMENT);

                var nodeKey = node.nodeName;

                if (null == documentTree[nodeKey]) documentTree[nodeKey] = [];

                documentTree[nodeKey].push(node);
            };

            handler.documentType = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.DOCUMENT_TYPE);
            };

            handler.documentFragment = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.DOCUMENT_FRAGMENT);
            };

            handler.notation = function (node) {
                expect(node.nodeType).toEqual(autopulous.xml.nodeTypes.NOTATION);
            };

            autopulous.xml.processNodes(handler, documentRootNode);

            messageRootNode = documentRootNode.retrieveNode("Envelope", 1, "Body", 1, "GetUserResponse", 1);

            bogusUnattachedNode = xmlLoadResult.response.createElement("Bogus");
        });

        it("should load and parse cleanly", function loadXml(done) {
            autopulous.xml.handler.result = function (result) {
                xmlLoadResult = result;

                done(); // allows the function set by afterEach() and the follow on it() functions to process
            };

            autopulous.xml.load(url);
        });

        it("should have a valid XML response", function () {
            expect(xmlLoadResult.xmlHttpStatus).toEqual(200);
            expect(xmlLoadResult.response.nodeName).toEqual("#document");
            expect(xmlLoadResult.rootNode.nodeName).toEqual(localName);
        });

        it("should be able to determine when an arbitrary element has a #text child node", function () {
            expect(autopulous.xml.isTextualNodeType(elementTree["GetUserResponse"][0])).toEqual(false);
            expect(autopulous.xml.isTextualNodeType(elementTree["RoleKey"][5])).toEqual(false);

            expect(autopulous.xml.isTextualNodeType(undefined)).toEqual(false);
            expect(autopulous.xml.isTextualNodeType(null)).toEqual(false);
            expect(autopulous.xml.isTextualNodeType(bogusUnattachedNode)).toEqual(false);
            expect(autopulous.xml.isTextualNodeType(textTree["Enabled"][0])).toEqual(true);
            expect(autopulous.xml.isTextualNodeType(textTree["Enabled"][5])).toEqual(true);
            expect(autopulous.xml.isTextualNodeType(textTree["RoleName"][0])).toEqual(true);
            expect(autopulous.xml.isTextualNodeType(textTree["RoleName"][5])).toEqual(true);

            expect(textTree["RoleName"][5].isTextualNodeType).toEqual(true);
        });

        it("should be able to get the value from an arbitrary text node", function () {
            expect(autopulous.xml.getValue(textTree["Enabled"][0])).toEqual("true");
            expect(autopulous.xml.getValue(textTree["Enabled"][5])).toEqual("true");
            expect(autopulous.xml.getValue(textTree["RoleName"][0])).toEqual("Vertex Provision Administrator");
            expect(autopulous.xml.getValue(textTree["RoleName"][5])).toEqual("Vertex Enterprise Administrator");

            expect(textTree["RoleName"][5].value).toEqual("Vertex Enterprise Administrator");
        });

        it("should NOT be able to get the value of a bogus or arbitrary element node", function () {
            expect(autopulous.xml.getValue(undefined)).toEqual(null);
            expect(autopulous.xml.getValue(null)).toEqual(null);
            expect(autopulous.xml.getValue(bogusUnattachedNode)).toEqual(null);
            expect(autopulous.xml.getValue(elementTree["GetUserResponse"][0])).toEqual(null);
            expect(autopulous.xml.getValue(elementTree["RoleKey"][5])).toEqual(null);
            expect(autopulous.xml.getValue(elementTree["RoleName"][4])).toEqual(null);

            expect(elementTree["RoleName"][5].value).toEqual(null);
        });

        it("should be able to get the parent element node from the XML response of a text node", function () {
            expect(autopulous.xml.getParent(textTree["Enabled"][0])).toEqual(elementTree["Enabled"][0]);
            expect(autopulous.xml.getParent(textTree["Enabled"][5])).toEqual(elementTree["Enabled"][5]);
            expect(autopulous.xml.getParent(textTree["RoleName"][0])).toEqual(elementTree["RoleName"][0]);
            expect(autopulous.xml.getParent(textTree["RoleName"][5])).toEqual(elementTree["RoleName"][5]);

            expect(textTree["RoleName"][5].parent).toEqual(elementTree["RoleName"][5]);
        });

        it("should NOT be able to get the parent element node from the XML response of a text node", function () {
            expect(autopulous.xml.getParent(undefined)).toEqual(null);
            expect(autopulous.xml.getParent(null)).toEqual(null);
            expect(autopulous.xml.getParent(bogusUnattachedNode)).toEqual(null);
        });

        it("should be able to get the parent of an arbitrary element node from the XML response", function () {
            expect(autopulous.xml.getParent(elementTree["UserKey"][0])).toEqual(elementTree["User"][0]);
            expect(autopulous.xml.getParent(elementTree["RoleSummary"][0])).toEqual(elementTree["User"][0]);
            expect(autopulous.xml.getParent(elementTree["RoleSummary"][5])).toEqual(elementTree["User"][0]);
            expect(autopulous.xml.getParent(elementTree["Description"][0])).toEqual(elementTree["User"][0]);

            expect(autopulous.xml.getParent(elementTree["Description"][5])).toEqual(elementTree["RoleSummary"][4]);

            expect(autopulous.xml.getParent(elementTree["User"][0])).toEqual(elementTree["GetUserResponse"][0]);

            expect(autopulous.xml.getParent(elementTree["Envelope"][0])).toEqual(documentTree["#document"][0]);

            expect(elementTree["Envelope"][0].parent).toEqual(documentTree["#document"][0]);
            expect(elementTree["User"][0].parent).toEqual(elementTree["GetUserResponse"][0]);
        });

        it("should NOT be able to get the parent of an arbitrary element node from the XML response", function () {
            expect(autopulous.xml.getParent(documentTree["#document"][0])).toEqual(null);
            expect(documentTree["#document"][0].parent).toEqual(null);
        });

        it("should be able to determine that an arbitrary element node exists multiply in the XML response", function () {
            expect(autopulous.xml.hasMultipleInstances(elementTree["GetUserResponse"][0])).toEqual(false);
            expect(autopulous.xml.hasMultipleInstances(elementTree["RoleSummary"][0])).toEqual(true);
            expect(autopulous.xml.hasMultipleInstances(elementTree["RoleSummary"][5])).toEqual(true);
            expect(autopulous.xml.hasMultipleInstances(elementTree["RoleKey"][0])).toEqual(false);
            expect(autopulous.xml.hasMultipleInstances(elementTree["RoleKey"][5])).toEqual(false);
        });

        it("should be able to determine that BAD element nodes have no multiplicity in the XML response", function () {
            expect(autopulous.xml.hasMultipleInstances(undefined)).toEqual(false);
            expect(autopulous.xml.hasMultipleInstances(null)).toEqual(false);
            expect(autopulous.xml.hasMultipleInstances(bogusUnattachedNode)).toEqual(false);
        });

        it("should be able to determine the number of instances of an element in the XML response", function () {
            expect(autopulous.xml.getInstanceCount(elementTree["GetUserResponse"][0])).toEqual(1);
            expect(autopulous.xml.getInstanceCount(elementTree["RoleSummary"][0])).toEqual(6);
            expect(autopulous.xml.getInstanceCount(elementTree["RoleSummary"][5])).toEqual(6);
            expect(autopulous.xml.getInstanceCount(elementTree["RoleKey"][0])).toEqual(1);
            expect(autopulous.xml.getInstanceCount(elementTree["RoleKey"][5])).toEqual(1);

            expect(messageRootNode.instanceCount).toEqual(1);
            expect(messageRootNode.retrieveNode("User", "RoleSummary").instanceCount).toEqual(6);

            expect(messageRootNode.getInstanceCount()).toEqual(1);
            expect(messageRootNode.getInstanceCount("User")).toEqual(1);
            expect(messageRootNode.getInstanceCount("User", "UserKey")).toEqual(1);
            expect(messageRootNode.getInstanceCount("User", "RoleSummary")).toEqual(6);
            expect(messageRootNode.retrieveNode("User", "RoleSummary").getInstanceCount()).toEqual(6);
        });

        it("should be able to determine that BAD element nodes have no instances in the XML response", function () {
            expect(autopulous.xml.getInstanceCount(undefined)).toEqual(0);
            expect(autopulous.xml.getInstanceCount(null)).toEqual(0);
            expect(autopulous.xml.getInstanceCount(bogusUnattachedNode)).toEqual(0);
        });

        it("should be able to determine the which instance an element is in the XML response", function () {
            expect(autopulous.xml.getInstanceOrdinal(elementTree["GetUserResponse"][0])).toEqual(1);
            expect(autopulous.xml.getInstanceOrdinal(elementTree["RoleSummary"][0])).toEqual(1);
            expect(autopulous.xml.getInstanceOrdinal(elementTree["RoleSummary"][5])).toEqual(6);
            expect(autopulous.xml.getInstanceOrdinal(elementTree["RoleKey"][0])).toEqual(1);
            expect(autopulous.xml.getInstanceOrdinal(elementTree["RoleKey"][5])).toEqual(1);

            expect(messageRootNode.instanceOrdinal).toEqual(1);
            expect(messageRootNode.retrieveNode("User", "RoleSummary", 4).instanceOrdinal).toEqual(4);
        });

        it("should be able to determine that BAD element node do not have an instance index in the XML response", function () {
            expect(autopulous.xml.getInstanceOrdinal(undefined)).toEqual(null);
            expect(autopulous.xml.getInstanceOrdinal(null)).toEqual(null);
            expect(autopulous.xml.getInstanceOrdinal(bogusUnattachedNode)).toEqual(null);
        });

        it("should be able to look up and retrieve elements from the XML response", function () {
            expect(autopulous.xml.retrieveNode(documentRootNode)).toEqual(documentRootNode);
            expect(autopulous.xml.retrieveNode(documentRootNode, "Envelope", "Body", "GetUserResponse")).toEqual(elementTree["GetUserResponse"][0]);
            expect(autopulous.xml.retrieveNode(documentRootNode, "Envelope", "Body", "GetUserResponse", 1)).toEqual(elementTree["GetUserResponse"][0]);
            expect(autopulous.xml.retrieveNode(documentRootNode, "Envelope", "Body", 1, "GetUserResponse")).toEqual(elementTree["GetUserResponse"][0]);
            expect(autopulous.xml.retrieveNode(documentRootNode, "Envelope", 1, "Body", 1, "GetUserResponse")).toEqual(elementTree["GetUserResponse"][0]);
            expect(autopulous.xml.retrieveNode(documentRootNode, "Envelope", 1, "Body", 1, "GetUserResponse", 1)).toEqual(elementTree["GetUserResponse"][0]);

            expect(documentRootNode.retrieveNode()).toEqual(documentTree["#document"][0]);
            expect(documentRootNode.retrieveNode("Envelope", "Body", "GetUserResponse", "User", "RoleSummary", 3, "RoleName")).toEqual(elementTree["RoleName"][2]);

            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "Description")).toEqual(elementTree["Description"][0]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "UserKey")).toEqual(elementTree["UserKey"][0]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "ForcePasswordChange")).toEqual(elementTree["ForcePasswordChange"][0]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary")).toEqual(elementTree["RoleSummary"][0]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", 2)).toEqual(elementTree["RoleSummary"][1]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", 6)).toEqual(elementTree["RoleSummary"][5]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", 5, "ReadOnly")).toEqual(elementTree["ReadOnly"][4]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", 6, "CountOfUsers")).toEqual(elementTree["CountOfUsers"][5]);

            expect(messageRootNode.retrieveNode("User", "RoleSummary", 3, "RoleName", "#text").nodeValue).toEqual("Vertex Direct Tax Data Warehouse Data Steward");
        });

        it("should NOT be able to look up and retrieve non-elements from the XML response", function () {
            expect(autopulous.xml.retrieveNode(null)).toEqual(null);
            expect(autopulous.xml.retrieveNode(undefined)).toEqual(null);
        });

        it("should be able to look up and retrieve an element attribute in the XML response", function () {
            expect(autopulous.xml.retrieveNode(documentRootNode, "Envelope", "Body", "GetUserResponse", "User", "UserKey", "@userId")).toEqual(attributeTree["userId"][0]);

            expect(documentRootNode.retrieveNode("Envelope", "Body", "GetUserResponse", "User", "UserKey", "@userId")).toEqual(attributeTree["userId"][0]);

            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "@countOfBIUsers")).toEqual(attributeTree["countOfBIUsers"][0]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", "RoleKey", "@roleId")).toEqual(attributeTree["roleId"][0]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", 2, "RoleKey", "@roleName")).toEqual(attributeTree["roleName"][1]);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", 6, "RoleKey", "@roleName")).toEqual(attributeTree["roleName"][5]);

            expect(messageRootNode.retrieveNode("User", "RoleSummary", 5, "RoleKey", "@roleName")).toEqual(attributeTree["roleName"][4]);
        });

        it("should be NOT able to look up and retrieve an attribute of bad element or attribute reference in the XML response", function () {
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "@roleName")).toEqual(null);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "#text", "@countOfBIUsers")).toEqual(null);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", 1, "RoleKey", "@countOfBIUsers")).toEqual(null);
            expect(autopulous.xml.retrieveNode(messageRootNode, "User", "RoleSummary", 6, "RoleKey", "@countOfBIUsers")).toEqual(null);

            expect(messageRootNode.retrieveNode("User", "RoleSummary", 9999, "RoleKey", "@roleId")).toEqual(null);
        });

        it("should be able to look up and retrieve the value of an text element in the XML response", function () {
            expect(autopulous.xml.retrieveText(documentRootNode, "Envelope", "Body", "GetUserResponse", "User", "RoleSummary", 3, "RoleName")).toEqual("Vertex Direct Tax Data Warehouse Data Steward");
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "RoleSummary", 3, "RoleName")).toEqual("Vertex Direct Tax Data Warehouse Data Steward");

            expect(documentRootNode.retrieveText("Envelope", "Body", "GetUserResponse", "User", "RoleSummary", 3, "RoleName")).toEqual("Vertex Direct Tax Data Warehouse Data Steward");
            expect(messageRootNode.retrieveText("User", "RoleSummary", 3, "RoleName")).toEqual("Vertex Direct Tax Data Warehouse Data Steward");
        });

        it("should be NOT able to look up and retrieve the value of bad text element references in the XML response", function () {
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "RoleSummary", 3, "RoleName", "#text")).toEqual(null);

            expect(messageRootNode.retrieveText("User", "RoleSummary", 9999, "RoleName")).toEqual(null);
        });

        it("should be able to look up and retrieve the value of an element attribute in the XML response", function () {
            expect(autopulous.xml.retrieveText(documentRootNode, "Envelope", "Body", "GetUserResponse", "User", "UserKey", "@userId")).toEqual("101");

            expect(documentRootNode.retrieveText("Envelope", "Body", "GetUserResponse", "User", "RoleSummary", 4, "RoleKey", 1, "@roleName")).toEqual("Vertex Direct Tax Data Warehouse Data Provider");

            expect(autopulous.xml.retrieveText(messageRootNode, "User", "@countOfBIUsers")).toEqual("3");
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "RoleSummary", "RoleKey", "@roleId")).toEqual("1");
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "RoleSummary", 2, "RoleKey", "@roleName")).toEqual("Vertex Provision User");
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "RoleSummary", 6, "RoleKey", "@roleName")).toEqual("Vertex Enterprise Administrator");

            expect(messageRootNode.retrieveText("User", "RoleSummary", 6, "RoleKey", "@roleId")).toEqual("31");
        });

        it("should be NOT able to look up and retrieve the value of an attribute of bad element or attribute reference in the XML response", function () {
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "@roleName")).toEqual(null);
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "#text", "@countOfBIUsers")).toEqual(null);
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "RoleSummary", 1, "RoleKey", "@countOfBIUsers")).toEqual(null);
            expect(autopulous.xml.retrieveText(messageRootNode, "User", "RoleSummary", 6, "RoleKey", "@countOfBIUsers")).toEqual(null);

            expect(messageRootNode.retrieveText("User", "RoleSummary", 9999, "RoleKey", "@roleId")).toEqual(null);
        });
    });

    describe("Semi-practical example of loading and parsing: /base/test/resources/FindDimensionMemberKeysAllLRResponse.xml", function () {
        var url = "/base/test/resources/FindDimensionMemberKeysAllLRResponse.xml";

        var xmlLoadResult;
        var contentRootNode;

        it("should load and parse cleanly", function loadXml(done) {
            autopulous.xml.handler.result = function (result) {
                xmlLoadResult = result;
                contentRootNode = xmlLoadResult.rootNode;

                done(); // allows the function set by afterEach() and the follow on it() functions to process
            };

            autopulous.xml.load(url, "Envelope", "Body", "FindDimensionMemberKeysAllLRResponse", "DimensionMemberKeys");
        });

        it("should have a valid XML response", function () {
            expect(xmlLoadResult.xmlHttpStatus).toEqual(200);
            expect(xmlLoadResult.response.nodeName).toEqual("#document");
            expect(xmlLoadResult.rootNode.localName).toEqual("DimensionMemberKeys");
        });

        it("should look like the body of a simple table on a web page built from the XML response", function () {
            var body = "";

            var table = "";

            table += "<table>\n";
            table += "<th><td>Multi Value Set</td><td>Dim Mem ID</td><td>Dim Key (ID)</td><td>Disp Label</td><td>Disp Code</td><td>Disp Desc</td><td>Value Set Name</td><td>Name</td><td>Dim Mem Status</td><td>Editiable</td><td>Source Sys</td></th>\n";

            var dimensionMemberKeyListNode = contentRootNode.retrieveNode("DimensionMemberKeyList");

            expect(dimensionMemberKeyListNode).not.toEqual(null);

            var dimensionMemberKeyCount = dimensionMemberKeyListNode.getInstanceCount("DimensionMemberKey");

            expect(dimensionMemberKeyCount).toEqual(6);

            for (var dimensionMemberKeyOrdinal = 1; dimensionMemberKeyCount >= dimensionMemberKeyOrdinal; dimensionMemberKeyOrdinal++) {
                var dimensionMemberKeyNode = dimensionMemberKeyListNode.retrieveNode("DimensionMemberKey", dimensionMemberKeyOrdinal);

                expect(dimensionMemberKeyNode).not.toEqual(null);

                var tableRow = "<tr>";

                expect(dimensionMemberKeyNode.retrieveText("@MultiValSetEnabledInd")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("@dimensionMemberId")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("DimensionKey", "@dimensionId")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("DisplayLabel")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("DisplayCode")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("DisplayDescription")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("ValueSetName")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("Name")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("DimensionMemberStatus")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("EditableIndicator")).not.toEqual(null);
                expect(dimensionMemberKeyNode.retrieveText("SourceSystem")).not.toEqual(null);

                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("@MultiValSetEnabledInd") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("@dimensionMemberId") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("DimensionKey", "@dimensionId") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("DisplayLabel") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("DisplayCode") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("DisplayDescription") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("ValueSetName") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("Name") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("DimensionMemberStatus") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("EditableIndicator") + "</td>";
                tableRow += "<td>" + dimensionMemberKeyNode.retrieveText("SourceSystem") + "</td>";

                tableRow += "</tr>\n";

                table += tableRow;
            }

            table += "</table>\n";

            body += table;

            expect(contentRootNode.retrieveText("BackedBy")).not.toEqual(null);
            expect(contentRootNode.retrieveText("RowLimited")).not.toEqual(null);
            expect(contentRootNode.retrieveText("NameDisplayIndicator")).not.toEqual(null);

            body += "<p>Backed by: " + contentRootNode.retrieveText("BackedBy") + "</p>\n";
            body += "<p>Row Limited is: " + contentRootNode.retrieveText("RowLimited") + "</p>\n";
            body += "<p>Name Display Indicator is: " + contentRootNode.retrieveText("NameDisplayIndicator") + "</p>";

            console.log(body);
        });
    });
});