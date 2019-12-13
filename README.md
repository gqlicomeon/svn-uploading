# svn-uploading
一个简便的svn代码上传插件，初始化后只需调用svn.upload即可实现svn上传功能
## 安装：
`$ npm install svn-uploading`

## 用法示例：
初始化svn仓库
```js
    const SvnUploading = require("svn-uploading");
    //可以初始化多个仓库
    svn = new SvnUploading({
       cwd:""//要上传文件所处的svn checkout目录绝对路径，{必填}
    })
```
`svn update 更新代码`
```js
    svn.update().then(bol=>{
        //bol true or false
    }).catch(err=>{
    
    })
```
`svn check 查看代码更改状态`
```js
    //方法返回promise 的thenable对象
    svn.check().then(status=>{
        //do something
        //status ==> {add:["addfilepath1","addfilepath2",...],modify:["modifypath1",modifypath2,...]}
    }).catch(err=>{
        //something error
    })  
```
`svn add 添加代码到svn仓库`
```js
    /**
    *@param {String} 要添加到仓库的文件或文件夹的路径(绝对路径或相对路径)，不填则默认为初始化cwd目录下的所有文件
    */
    svn.add(url).then(bol=>{
        //bol 是否添加成功
    }).catch(err=>{
        //something error
    })
```
`svn upload 封装了以上方法，上传文件`
```js
     /**
     * @param {Object}
     * @description {name} 上传单个文件时name为文件或文件名的相对路径或绝对路径；若上传cwd路径下的所有文件，name传空
     * @description {msg} 本次上传说明
     */
    svn.upload(url).then(bol=>{
        //bol 是否上传成功
    }).then(err=>{
         //something error
    })
```