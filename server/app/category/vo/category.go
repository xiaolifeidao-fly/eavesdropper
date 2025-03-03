package vo

type CategoryAddReq struct {
	TbId      uint64 `json:"tbId"`
	Name      string `json:"name"`
	PId       uint64 `json:"pId"`
	Leaf      bool   `json:"leaf"`
	GroupName string `json:"groupName"`
	GroupId   string `json:"groupId"`
}
