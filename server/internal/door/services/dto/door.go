package dto

import (
	"server/common/base"
	"server/common/base/dto"
	"strings"
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
	Pix        string `json:"pix"`
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
		"deliveryVO":       "skuInfo.componentsVO.deliveryVO",
	}
}

// SetRequiredDefault 设置必填字段默认值
func (d *DoorSkuDTO) SetRequiredDefault(doorInfoValueMap map[string]interface{}) {
	d.BaseInfo.SetRequiredDefault(doorInfoValueMap["baseInfo"].(map[string]interface{}))
	d.DoorSkuSaleInfo.SetRequiredDefault()
	d.DoorSkuLogisticsInfo.SetRequiredDefault(doorInfoValueMap["deliveryVO"].(map[string]interface{}))
	d.DoorSkuImageInfo.SetRequiredDefault()
}

// DoorSkuBaseInfoDTO 商品基础信息
type DoorSkuBaseInfoDTO struct {
	ItemId              string     `json:"itemId"`              // 商品ID
	SkuType             string     `json:"skuType"`             // 宝贝类型, 必填（自动填充）, 全新 5,二手 6
	MainImages          []string   `json:"mainImages"`          // 宝贝主图, 必填
	Title               string     `json:"title"`               // 宝贝标题, 必填
	GuideTitle          string     `json:"guideTitle"`          // 导购标题
	SkuItems            []*SkuItem `json:"skuItems"`            // 商品规格, 直接对Infos进行处理
	ProcurementLocation string     `json:"procurementLocation"` // 采购地, 必填, 中国内地（大陆）,中国港澳台地区及其他国家和地区
}

func (d *DoorSkuBaseInfoDTO) ToExtractorRule() map[string]interface{} {
	return map[string]interface{}{
		"mainImages":  "skuInfo.item.images",
		"title":       "skuInfo.item.title",
		"guideTitle":  "skuInfo.item.title",
		"itemId":      "skuInfo.item.itemId",
		"skuItemInfo": "skuInfo.componentsVO.extensionInfoVO.infos",
	}
}

// SetRequiredDefault 设置必填字段默认值
func (d *DoorSkuBaseInfoDTO) SetRequiredDefault(doorInfoValueMap map[string]interface{}) {
	skuItemInfos := doorInfoValueMap["skuItemInfo"].([]interface{})
	skuItems := []*SkuItem{}
	for _, skuItemInfo := range skuItemInfos {
		skuItemInfoMap := skuItemInfo.(map[string]interface{})
		itemType := skuItemInfoMap["type"]
		if itemType == "BASE_PROPS" {
			items := skuItemInfoMap["items"].([]interface{})
			for _, item := range items {
				itemMap := item.(map[string]interface{})
				skuItem := &SkuItem{}
				skuItem.Title = itemMap["title"].(string)
				texts := itemMap["text"].([]interface{})
				skuItem.Text = make([]string, len(texts))
				for i, text := range texts {
					skuItem.Text[i] = text.(string)
				}
				skuItems = append(skuItems, skuItem)
			}
		}
	}
	d.SkuItems = skuItems
	// 宝贝类型, 默认全新5, 二手6
	d.SkuType = "5"

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
	HasImage      string           `json:"hasImage"`      // 是否有图片
	ComboProperty string           `json:"comboProperty"` // 是否是组合属性
	Label         string           `json:"label"`         // 属性名称
	PackPro       string           `json:"packPro"`       // 是否是打包属性
	Pid           string           `json:"pid"`           // 属性ID
	Values        []SalesAttrValue `json:"values"`        // 属性值
}

type SalesAttrValue struct {
	Text      string `json:"text"`      // 属性值
	Value     string `json:"value"`     // 属性值ID
	Image     string `json:"image"`     // 属性值图片
	SortOrder string `json:"sortOrder"` // 排序
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
	DeliveryFromAddr string `json:"deliveryFromAddr"` // 发货地址
	IsFreeShipping   bool   `json:"isFreeShipping"`   //是否包邮
}

func (d *DoorSkuLogisticsInfoDTO) SetRequiredDefault(deliveryVO map[string]interface{}) {
	d.DeliveryFromAddr = deliveryVO["deliveryFromAddr"].(string)
	freight := deliveryVO["freight"].(string)
	if strings.Contains(freight, "免运费") {
		d.IsFreeShipping = true
	} else {
		d.IsFreeShipping = false
	}
}

// SetRequiredDefault 设置必填字段默认值

type SkuItem struct {
	Text  []string `json:"text"`  // 属性值列表
	Title string   `json:"value"` // 属性值ID
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
		"doorSkuImageInfos": "skuDetail.components",
	}
}

// SetRequiredDefault 设置必填字段默认值
func (d *DoorSkuImageInfoDTO) SetRequiredDefault() {
}

type DoorSkuImageInfoInfoDTO struct {
	Type    string `json:"type"`    // 类型, 文本(text), 图片(image)
	Content string `json:"content"` // 内容, 图片: 图片地址， 文本: 文本内容
}
