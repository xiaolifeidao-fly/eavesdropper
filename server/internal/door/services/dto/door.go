package dto

import (
	"server/common/base"
	"server/common/base/dto"
)

type DoorRecordDTO struct {
	dto.BaseDTO
	ItemKey    string    `json:"itemKey"`
	Type       string    `json:"type"`
	DoorKey    string    `json:"doorKey"`
	Url        string    `json:"url"`
	Data       string    `json:"data"`
	Version    string    `json:"version"`
	ExpireTime base.Time `json:"expire_time"`
}

type DoorFileRecordDTO struct {
	dto.BaseDTO
	ResourceId uint64 `json:"resourceId"`
	Source     string `json:"source"`
	FileType   string `json:"fileType"`
	FileSize   uint64 `json:"fileSize"`
	FolderId   string `json:"folderId"`
	FileId     string `json:"fileId"`
	FileUrl    string `json:"fileUrl"`
	FileName   string `json:"fileName"`
	FileKey    string `json:"fileKey"`
}

// DoorSkuDTO 商品信息
type DoorSkuDTO struct {
	BaseInfo             DoorSkuBaseInfoDTO      `json:"baseInfo"`             // 商品基础信息
	DoorSkuSaleInfo      DoorSkuSaleInfoDTO      `json:"doorSkuSaleInfo"`      // 商品销售信息
	DoorSkuLogisticsInfo DoorSkuLogisticsInfoDTO `json:"doorSkuLogisticsInfo"` // 商品物流信息
	DoorSkuImageInfo     DoorSkuImageInfoDTO     `json:"doorSkuImageInfo"`     // 商品图文信息
}

func (d *DoorSkuDTO) ToExtractorRule() map[string]interface{} {
	return map[string]interface{}{
		"baseInfo":         d.BaseInfo.ToExtractorRule(),
		"doorSkuSaleInfo":  d.DoorSkuSaleInfo.ToExtractorRule(),
		"doorSkuImageInfo": d.DoorSkuImageInfo.ToExtractorRule(),
	}
}

// SetRequiredDefault 设置必填字段默认值
func (d *DoorSkuDTO) SetRequiredDefault() {
	d.BaseInfo.SetRequiredDefault()
	d.DoorSkuSaleInfo.SetRequiredDefault()
	d.DoorSkuLogisticsInfo.SetRequiredDefault()
	d.DoorSkuImageInfo.SetRequiredDefault()
}

// DoorSkuBaseInfoDTO 商品基础信息
type DoorSkuBaseInfoDTO struct {
	ItemId              string                 `json:"itemId"`              // 商品ID
	SkuType             string                 `json:"skuType"`             // 宝贝类型, 必填（自动填充）, 全新 5,二手 6
	MainImages          []string               `json:"mainImages"`          // 宝贝主图, 必填
	Title               string                 `json:"title"`               // 宝贝标题, 必填
	GuideTitle          string                 `json:"guideTitle"`          // 导购标题
	CategoryAttr        map[string]interface{} `json:"categoryAttr"`        // 类目属性, 必填, 填充: 无品牌
	ProcurementLocation string                 `json:"procurementLocation"` // 采购地, 必填, 中国内地（大陆）,中国港澳台地区及其他国家和地区
}

func (d *DoorSkuBaseInfoDTO) ToExtractorRule() map[string]interface{} {
	return map[string]interface{}{
		"mainImages": "skuInfo.item.images",
		"title":      "skuInfo.item.title",
		"guideTitle": "skuInfo.item.title",
		"itemId":     "skuInfo.item.itemId",
	}
}

// SetRequiredDefault 设置必填字段默认值
func (d *DoorSkuBaseInfoDTO) SetRequiredDefault() {
	// 宝贝类型, 默认全新5, 二手6
	d.SkuType = "5"

	// 类目属性, 本身是一个大项， 具有n个小项， {"p-20000":{"text":"无品牌","value":"3246379"}}
	// 剩下的值在通过商品ID创建发布商品时会自动填充一部分, 无品牌可以保证该字段必填通过
	d.CategoryAttr = map[string]interface{}{
		"p-20000": map[string]interface{}{
			"text":  "无品牌",
			"value": 3246379,
		},
	}

	// 采购地, 默认中国内地（大陆）, 选择其他地区具有复杂的数据结构
	d.ProcurementLocation = "globalStock_1"
}

// DoorSkuSaleInfoDTO
type DoorSkuSaleInfoDTO struct {

	// 销售属性, 通过商品ID创建发布商品时会自动填充一部分, 需要手动去填充详细的值
	// 例如: {"p-1627207":[{"text":"白色","value":28320},{"text":"绿色","value":28335}]}
	// 注意: 销售属性是map，key是属性ID，value是属性值数组， 数组中的值: text 是填充的值, value是生成的淘宝中的id（看起来填充text就好）
	SalesAttr map[string]SalesAttr `json:"salesAttr"` // 销售属性

	// 销售规格, 页面上会根据选择的销售属性的笛卡尔积来生成销售规格
	SalesSkus []SalesSku `json:"salesSkus"` // 销售规格

	Price        string       `json:"price"`        // 一口价, 必填, 注意取得是价格字符串,160或者160.81
	Quantity     string       `json:"quantity"`     // 库存, 必填
	PurchaseTips string       `json:"purchaseTips"` // 购买须知
	OuterId      string       `json:"outerId"`      // 商家编码
	Barcode      string       `json:"barcode"`      // 商品条形码
	SubStock     string       `json:"subStock"`     // 拍下减库存, 必填, 0: 不减库存, 1: 拍下减库存
	ShelfTime    ShelfTimeDTO `json:"shelfTime"`    // 上架时间, 必填, 0: 立刻上架, 1: 定时上架, 2: 放入仓库
}

func (d *DoorSkuSaleInfoDTO) ToExtractorRule() map[string]interface{} {

	return map[string]interface{}{
		// salesAttr 需要进行一定的规则解析 mbParseDoorSkuSaleInfoSalesAttrs
		"salesAttr": "skuInfo.skuBase.props",

		// salesSkus 需要进行一定的规则解析 mbParseDoorSkuSaleInfoSalesSkus
		"salesSkus":  "skuInfo.skuBase.skus",     // 得到的是通过销售属性笛卡尔积生成的销售规格列表
		"salesSkus2": "skuInfo.skuCore.sku2info", // 详细的销售规格列表， 提取价格和库存

		// 0 代表的是汇总的 sku2info 是一个数组，基于销售属性来填充
		"price":    "skuInfo.skuCore.sku2info.0.price.priceText",
		"quantity": "skuInfo.skuCore.sku2info.0.quantity",
	}
}

// SetRequiredDefault 设置必填字段默认值
func (d *DoorSkuSaleInfoDTO) SetRequiredDefault() {
	// 拍下减库存
	d.SubStock = "1"

	// 上架时间
	d.ShelfTime.Type = 0
	d.ShelfTime.ShelfTime = nil
}

type SalesAttr struct {
	Label  string           `json:"label"`  // 属性名称
	Values []SalesAttrValue `json:"values"` // 属性值
}

type SalesAttrValue struct {
	Text  string `json:"text"`  // 属性值
	Value string `json:"value"` // 属性值ID
}

type SalesSku struct {
	SalePropPath string `json:"salePropPath"` // 销售属性路径, 由:属性key:属性值key组成,多个使用 ; 连接
	Price        string `json:"price"`        // 价格
	Quantity     string `json:"quantity"`     // 库存
}

// ShelfTimeDTO 上架时间
// 上架类型：0: 立刻上架, 1: 定时上架, 2: 放入仓库
// 上架时间： 1733313663000 是 2024-10-10 10:10:10
type ShelfTimeDTO struct {
	Type      int64  `json:"type"`      // 类型, 0: 立刻上架, 1: 定时上架, 2: 放入仓库
	ShelfTime *int64 `json:"shelfTime"` // 上架时间
}

// DoorSkuLogisticsInfoDTO 商品物流信息
type DoorSkuLogisticsInfoDTO struct {
	DispatchTimeframe    string `json:"dispatchTimeframe"`    // 发货时效, 必填（自动填充）, 24小时内发货,48小时内发货,大于48小时发货
	PickupMode           string `json:"pickupMode"`           // 提取方式, 必填, 使用物流配置, 选择：使用物流配送 -> 运费模板:系统模版-商家默认模版
	RegionalRestrictions string `json:"regionalRestrictions"` // 区域限制, 不设置商品维度区域限售模板,选择商品维度区域限售模板
	PostSaleSupport      string `json:"postSaleSupport"`      // 售后支持, 保修服务
}

// SetRequiredDefault 设置必填字段默认值
func (d *DoorSkuLogisticsInfoDTO) SetRequiredDefault() {
	// 发货时效, 默认48小时内发货->0, 24小时内发货->3, 大于48小时发货->2
	d.DispatchTimeframe = "0"

	// 提取方式, 选择：使用物流配送 -> 运费模板:系统模版-商家默认模版 （64723339970）
	d.PickupMode = "64723339970"

	// 区域限售, 默认不限制
	d.RegionalRestrictions = "regionLimitSale_1"
}

// DoorSkuImageInfoDTO 商品图文信息
type DoorSkuImageInfoDTO struct {
	Images     []string                   `json:"images"`            // 3:4主图, 直接对Infos进行处理
	Videos     []string                   `json:"videos"`            // 视频, 直接对Infos进行处理
	LongImages []string                   `json:"longImages"`        // 长图, 直接对Infos进行处理
	Infos      []*DoorSkuImageInfoInfoDTO `json:"doorSkuImageInfos"` // 商品详情, 通过正则表达式提取, 图片+文字
}

func (d *DoorSkuImageInfoDTO) ToExtractorRule() map[string]interface{} {

	// 商品详情: 获取到的数据是一段html, 需要通过正则表达式提取，查看函数 mbParseDoorSkuImageInfo
	return map[string]interface{}{
		"doorSkuImageInfos": "skuDetail.components.componentData.desc_richtext_pc.model.text",
	}
}

// SetRequiredDefault 设置必填字段默认值
func (d *DoorSkuImageInfoDTO) SetRequiredDefault() {
}

type DoorSkuImageInfoInfoDTO struct {
	Type    string `json:"type"`    // 类型, 文本(text), 图片(image)
	Content string `json:"content"` // 内容, 图片: 图片地址， 文本: 文本内容
}
