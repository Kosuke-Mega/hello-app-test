// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 単一ファイルの独立したSBTコントラクト（外部依存なし）
contract SoulboundToken {
    // イベント定義
    event Transfer(
        address indexed from, address indexed to, uint256 indexed id
    );
    
    // コントラクト名とシンボル
    string private _name;
    string private _symbol;
    
    // トークンIDから所有者へのマッピング
    mapping(uint256 => address) private _ownerOf;
    
    // アドレスごとのトークン数
    mapping(address => uint256) private _balanceOf;
    
    // トークンIDからメタデータURIへのマッピング
    mapping(uint256 => string) private _tokenURIs;
    
    // コントラクト所有者/管理者
    address public owner;
    
    // コンストラクタ
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
        owner = msg.sender;
    }
    
    // コントラクト所有者のみが呼び出せる関数用の修飾子
    modifier onlyOwner() {
        require(msg.sender == owner, "SBT: caller is not the owner");
        _;
    }
    
    // インターフェースのサポートを確認
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x80ac58cd || // ERC721インターフェースID
               interfaceId == 0x01ffc9a7;   // ERC165インターフェースID
    }
    
    // トークン名を取得
    function name() external view returns (string memory) {
        return _name;
    }
    
    // トークンシンボルを取得
    function symbol() external view returns (string memory) {
        return _symbol;
    }
    
    // 指定アドレスの残高（トークン数）を取得
    function balanceOf(address account) external view returns (uint256) {
        require(account != address(0), "SBT: balance query for the zero address");
        return _balanceOf[account];
    }
    
    // トークンの所有者を取得
    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _ownerOf[tokenId];
        require(owner != address(0), "SBT: owner query for nonexistent token");
        return owner;
    }
    
    // トークンのメタデータURIを取得
    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf[tokenId] != address(0), "SBT: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }
    
    // SBTはトランスファーできないためのエラーメッセージ
    function transferFrom(address, address, uint256) external pure {
        revert("SBT: tokens cannot be transferred");
    }
    
    function safeTransferFrom(address, address, uint256) external pure {
        revert("SBT: tokens cannot be transferred");
    }
    
    function safeTransferFrom(address, address, uint256, bytes calldata) external pure {
        revert("SBT: tokens cannot be transferred");
    }
    
    // 承認関連機能も無効化
    function approve(address, uint256) external pure {
        revert("SBT: tokens cannot be transferred");
    }
    
    function getApproved(uint256 tokenId) external view returns (address) {
        require(_ownerOf[tokenId] != address(0), "SBT: approved query for nonexistent token");
        return address(0); // 常にゼロアドレスを返す
    }
    
    function setApprovalForAll(address, bool) external pure {
        revert("SBT: tokens cannot be transferred");
    }
    
    function isApprovedForAll(address, address) external pure returns (bool) {
        return false; // 常にfalseを返す
    }
    
    // SBTをミント（管理者のみ）
    function mint(address to, uint256 tokenId, string memory uri) external {
        require(to != address(0), "SBT: mint to the zero address");
        require(_ownerOf[tokenId] == address(0), "SBT: token already minted");
        
        _balanceOf[to] += 1;
        _ownerOf[tokenId] = to;
        _tokenURIs[tokenId] = uri;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    // SBTを破棄（バーン）- トークン所有者またはコントラクト所有者のみ
    function burn(uint256 tokenId) external {
        address tokenOwner = _ownerOf[tokenId];
        require(tokenOwner != address(0), "SBT: burn of nonexistent token");
        require(
            msg.sender == tokenOwner || msg.sender == owner,
            "SBT: caller is not owner nor token owner"
        );
        
        // トークンデータをクリア
        _balanceOf[tokenOwner] -= 1;
        delete _ownerOf[tokenId];
        delete _tokenURIs[tokenId];
        
        emit Transfer(tokenOwner, address(0), tokenId);
    }
    
    // コントラクト所有権の移転
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SBT: new owner is the zero address");
        owner = newOwner;
    }
    
    // トークンの存在確認用ヘルパー関数
    function exists(uint256 tokenId) external view returns (bool) {
        return _ownerOf[tokenId] != address(0);
    }
}