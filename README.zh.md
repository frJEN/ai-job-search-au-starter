<p align="center">
  <img src="assets/mascot/pip_flight_loop.gif" alt="Pip, the courier bird" width="200">
</p>

# AI Job Search — Australia Starter

*在你自己的电脑上运行的求职助手,专门为澳洲就业市场打造。*

**语言 / Language:** [English (full)](README.md) · [Plain-English beginner guide](README.beginner.md) · 中文(本页)

> 如果这个项目对你有帮助,欢迎在 GitHub 上点个 ⭐ star,能帮助更多人发现它;如果你想直接支持开发,也非常欢迎请我喝杯咖啡: [Buy Me a Coffee](https://buymeacoffee.com/frJEN) · [爱发电 Afdian](https://afdian.com/a/frJEN)。完全随意,不点也没关系 —— 好好用就行。

> 说明:这是一个独立的开源项目,与 Anthropic 没有任何关联、未获其背书或赞助。**本项目没有任何加密货币、代币或付费赞助计划**,任何声称与本项目有关的此类信息均为诈骗。

---

本页面假设你从未用过终端(命令行)或任何编程工具。不需要任何编程经验,照着步骤一步步做就行。

## 这是什么?

这是一个住在你电脑里的 AI 助手,帮你找工作。你只需要告诉它一次自己的背景和技能,之后它可以:

- 在各大招聘网站上搜索适合你的职位
- 帮你读取你邮箱里已经收到的招聘提醒邮件,你不用自己一封封翻
- 在你花时间投递之前,先判断这个职位是否真的适合你
- 针对某个具体职位,写一份量身定制的简历和求职信
- 帮你记录投递了哪些职位、结果如何

**它绝对不会替你点"提交申请"。** 它只负责准备好一切,你来审核、你来发送 —— 全程由你掌控。

## 开始之前需要准备什么

- 一台 Mac 或 Windows 电脑
- 一个 Gmail 邮箱账号(免费,没有的话可以去 [gmail.com](https://gmail.com) 注册)。这是你接收招聘提醒邮件的邮箱,助手会在获得你许可的前提下读取这个邮箱,来查找新职位和申请进度更新。
- 大约 15-20 分钟完成一次性设置
- 不需要任何编程基础

## 一次性设置

按顺序做完以下步骤,只需要做一次。凡是提示"输入这句话"的地方,都是指打开 Claude Code 后跳出的黑色终端窗口 —— 把它当成在跟一个乐于助人的助手聊天就行,不是在写代码。

**1. 下载工具包**

打开 [github.com/frJEN/jobhunt-au-starter](https://github.com/frJEN/jobhunt-au-starter),点击绿色的 **Code** 按钮,选择 **Download ZIP**,下载后解压到一个好找的地方(比如桌面)。

**2. 安装 Claude Code**

这就是助手本身。按照[安装指南](https://docs.anthropic.com/en/docs/claude-code/getting-started)为你的电脑安装。你需要一个 Claude 订阅(Pro 或 Max)—— 可以理解成像 Netflix 那样的按月订阅,不是一次性购买,也不需要单独申请 API key。

**3. 打开文件夹并启动 Claude Code**

打开终端程序(Mac 上搜索 "Terminal";Windows 上用 Claude Code 安装程序帮你配置好的那个终端),把下面这两行复制粘贴进去,记得把路径改成你第 1 步解压的实际位置:

```bash
cd path/to/jobhunt-au-starter
claude
```

如果不确定具体路径,直接在 Claude Code 启动后告诉它,它可以帮你一起找。

**4. 让它把剩下的环境装好**

Claude Code 启动后,输入:

> Please check whether Bun and a LaTeX distribution are installed, and install whatever's missing.

它会逐个解释要安装什么,并在动手前征求你的同意,你只需要确认即可。

**5. 连接你的 Gmail**

打开 [claude.ai](https://claude.ai) → **Settings → Connectors**,连接上面"需要准备什么"里提到的 Gmail 账号。你之后在各招聘平台注册时也要用同一个邮箱 —— 统一用一个邮箱,才能让助手安全地读取你的招聘提醒邮件。

**6. 告诉它你的个人情况**

回到终端,输入:

```
/setup
```

它会像聊天一样问你的背景、技能、想找什么样的工作,自然回答就好。如果你手头没有现成的简历文件,这是最简单的方式。

**7. (可选,但推荐)让它帮你在各平台设置职位提醒**

```
/platform-sync
```

这一步会用**你自己的浏览器登录状态**,以你本人身份登录 LinkedIn/Seek/Indeed 等平台,并把职位提醒都指向第 5 步的 Gmail 邮箱。每一步真正的操作前,它都会先解释清楚并征求你的同意 —— 批准前请仔细看它说了什么。如果你不想用自动化方式,它也提供了完整的手动操作说明。

设置完成 🎉

## 日常真正会用到的命令

设置完成后,以上步骤不需要重复。之后只要想找工作了,运行下面这些命令就行:

| 命令 | 作用 | 使用频率 |
|---|---|---|
| `/scrape` | 在各招聘网站和你的邮箱里搜索新职位 | 每隔几天,或者你想看看有没有新机会的时候 |
| `/apply <粘贴职位链接或职位描述文本>` | 判断是否合适,然后帮你写一份定制简历和求职信供你审核 | 看到心动的职位时 |
| `/outcome` | 告诉它投递结果(面试、拒信、offer),它帮你更新记录 | 收到公司回复之后 |

以上基本就是你日常会用到的全部内容了。还有一些更进阶的命令(面试准备、自动同步 Gmail 里的申请状态等),如果想深入了解可以看[完整版 README](README.md)。

## 需要了解的几点

- **Outlook / Hotmail 邮箱的支持目前还在开发中**,未来可能会加入 —— 目前只完整支持 Gmail。
- 最终点击"提交申请"按钮的永远是你自己,这个工具不会替你做任何提交动作。
- 本项目**没有任何加密货币、代币或付费赞助计划**,任何声称与本项目有关的此类说法都是诈骗。

## 遇到问题怎么办

直接在终端里用大白话告诉 Claude Code 哪里出问题了,它通常能自己定位并解决,或者向你解释清楚。想了解更多细节,可以看 [SETUP.md](SETUP.md) 或[完整版 README](README.md)。
