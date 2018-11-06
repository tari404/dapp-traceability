pragma solidity ^0.4.23;

contract Traces {
    string public constant name = "Test Trace App";
    string public constant symbol = "TTA";
    uint256 private _capacity = 0;
    address private _founder;
    mapping (address => bool) private _authorization;
    mapping (uint256 => string) private _cargoesName;
    mapping (address => mapping (uint256 => uint256)) private _cargoes;
    mapping (address => uint256) private _cargoesCount;
    mapping (address => mapping (uint256 => uint256)) private _holdCargoes;
    mapping (uint256 => uint256) private _holdCargoIndex;
    mapping (address => uint256) private _holdCargoesCount;
    mapping (uint256 => mapping (uint256 => address)) private _logs;
    mapping (uint256 => uint256) private _transferTimes;

    event NewCargo(uint256 indexed _cargoID, address indexed _creater);
    event Transfer(uint256 indexed _cargoID, address indexed _from, address indexed _to);
    event Authorize(address indexed _address, bool _state);

    constructor () public {
        _founder = msg.sender;
        _authorization[msg.sender] = true;
    }

    function capacity () public view returns (uint256) { return _capacity; }
    function capacityOf (address _owner) public view returns (uint256) { return _cargoesCount[_owner]; }
    function cargoNameOf (uint256 _cargoID) public view returns (string) { return _cargoesName[_cargoID]; }
    function transferTimesOf (uint256 _cargoID) public view returns (uint256) {
        return _transferTimes[_cargoID];
    }
    function holderOf (uint256 _cargoID) public view returns (address) {
        return _logs[_cargoID][_transferTimes[_cargoID]];
    }
    function tracesOf (uint256 _cargoID) public view returns (address[] traces) {
        uint256 transferTime = _transferTimes[_cargoID];
        traces = new address[](transferTime + 1);
        for (uint256 i = 0; i <= transferTime; i++) {
            traces[i] = _logs[_cargoID][i];
        }
    }
    function allCreated (address _creater) public view returns (uint256[] cargoes) {
        uint256 count = _cargoesCount[_creater];
        cargoes = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            cargoes[i] = _cargoes[_creater][i];
        }
    }
    function allHolding (address _owner) public view returns (uint256[] cargoes) {
        uint256 count = _holdCargoesCount[_owner];
        cargoes = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            cargoes[i] = _holdCargoes[_owner][i + 1];
        }
    }

    function createNewCargo (string _cargoName) public returns (uint256 cargoID) {
        bool authorization = _authorization[msg.sender];
        require(authorization, "Unauthorized");
        uint256 count = _cargoesCount[msg.sender];
        require(count + 1 > count, "Personal storage capacity reaches the upper limit");
        require(_capacity + 1 > _capacity, "Total storage capacity reaches the upper limit");
        cargoID = uint256(keccak256(abi.encodePacked(msg.sender, count, _capacity)));
        _cargoes[msg.sender][count] = cargoID;
        _cargoesName[cargoID] = _cargoName;
        _logs[cargoID][0] = msg.sender;
        _addToHolder(msg.sender, cargoID);
        emit NewCargo(cargoID, msg.sender);
        _cargoesCount[msg.sender]++;
        _capacity++;
    }

    function setPermission (address _address, bool _state) public {
        _authorization[_address] = _state;
        emit Authorize(_address, _state);
    }

    function transfer (uint256 _cargoID, address _to) public returns (bool success) {
        uint256 transferTime = _transferTimes[_cargoID];
        address holder = _logs[_cargoID][transferTime];
        require(holder != address(0), "Nonexistent cargo");
        require(holder == msg.sender, "Unauthorized");
        require(holder != _to, "Don't allow transfer to yourself");
        require(_to != address(0), "Invalid target address");
        _transferTimes[_cargoID]++;
        _logs[_cargoID][transferTime + 1] = _to;
        _removeFromHolder(msg.sender, _cargoID);
        _addToHolder(_to, _cargoID);
        emit Transfer(_cargoID, holder, _to);
        return true;
    }

    function _removeFromHolder (address _oriHolder, uint256 _cargoID) private {
        uint256 count = _holdCargoesCount[_oriHolder];
        uint256 index = _holdCargoIndex[_cargoID];
        _holdCargoes[_oriHolder][index] = _holdCargoes[_oriHolder][count];
        _holdCargoesCount[_oriHolder]--;
    }
    function _addToHolder (address _newHolder, uint256 _cargoID) private {
        uint256 count = _holdCargoesCount[_newHolder];
        _holdCargoIndex[_cargoID] = count + 1;
        _holdCargoes[_newHolder][count + 1] = _cargoID;
        _holdCargoesCount[_newHolder]++;
    }
}
