# 已确认分房计划 JSON

制表脚本只接受已经通过用户确认的计划。每个人必须有唯一 `id`；同名人员也不能共用同一 `id`。

```json
{
  "group": {
    "groupCode": "KSS260808CN11",
    "fileTier": "01",
    "tourTitle": "行程名称",
    "departureDate": "2026-08-08",
    "touristCount": 28,
    "peopleCountText": "28+1",
    "flightInfo": "9C7049 上海浦东→清州 （08:00-11:05）；9C7050 清州→上海浦东 （16:35-17:35）",
    "roomCountNote": "用房14间，领队拼房"
  },
  "travelers": [
    {
      "id": "T001",
      "orderNo": "14057463",
      "sourceRemark": "男拼",
      "chineseName": "游客姓名",
      "englishName": "SURNAME/GIVENNAME",
      "gender": "男",
      "birthDate": "1980-01-01",
      "birthplace": "上海",
      "passportNo": "E00000000",
      "issueDate": "2023-01-01",
      "issuePlace": "中国-上海",
      "expiryDate": "2033-01-01",
      "phone": "13800000000"
    }
  ],
  "leader": {
    "id": "TL",
    "chineseName": "领队姓名",
    "englishName": "SURNAME/GIVENNAME",
    "gender": "男",
    "birthDate": "1980-01-01",
    "birthplace": "上海",
    "passportNo": "E00000000",
    "issueDate": "2023-01-01",
    "issuePlace": "中国-上海",
    "expiryDate": "2033-01-01",
    "phone": "13800000000"
  },
  "rooms": [
    {
      "number": 1,
      "roomType": "标间",
      "occupantIds": ["T001", "T002"]
    }
  ],
  "specialAssignments": [
    {
      "type": "家庭拆分并与领队拼房",
      "people": ["游客姓名", "领队姓名"],
      "reason": "订单备注男拼；两人均为成年男性",
      "resolution": "将该家庭整块移至末尾，游客与领队同房，领队最后一行"
    }
  ]
}
```

## 字段规则

- 日期统一使用 `YYYY-MM-DD`。
- `gender` 只能为 `男` 或 `女`。
- `orderNo` 不得为空；同一订单号视为同一家庭。
- `sourceRemark` 保存原始业务备注，仅用于审计，不直接写入输出备注列。
- `rooms` 的扁平顺序就是最终表格顺序。
- 有领队时，`leader.id` 必须唯一，领队必须是最后一间房的最后一个人。
- 用户明确确认无领队或导游时，写 `"leader": null`，`peopleCountText` 必须为“游客数+0”，`rooms` 中不得出现 `TL`。
- `group.flightInfo` 默认必须符合：`航班号 出发地→目的地 （起飞时间-到达时间）；航班号 出发地→目的地 （起飞时间-到达时间）`。除非用户明确要求，不添加日期、“去程/回程”、机场全称或航站楼。
- 只有用户明确要求其他航班写法时才设置 `group.allowCustomFlightFormat: true`；不得为了绕过格式校验自行设置。
- `roomType` 缺省时按 `标间`。
- 每间通常为 1 至 3 人；超出时先询问用户并调整计划。
- `specialAssignments` 记录所有单拼、家庭拆分、三人房、单住、领队拼房和特殊备注，供最终汇报使用。
- `group.roomCountNote` 可省略；脚本将写入 `用房X间`。存在领队拼房、单人房等必要说明时应显式填写。
