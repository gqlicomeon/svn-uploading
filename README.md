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
    svn.update().then(res=>{
        //do something
    }).catch(err=>{
    
    })
```
`svn check 查看代码更改状态`
```js
    //方法返回promise 的thenable对象
    svn.check().then(status=>{
        //do something
        //status ==> {addList:["addfilepath1","addfilepath2",...],modifyList:["modifypath1",modifypath2,...],deleteList:[],unknownList:[]}
    }).catch(err=>{
        //something error
    })  
```
`svn add 添加代码到svn仓库`
```js
    /**
    *@param {String} 要添加到仓库的文件或文件夹的路径(绝对路径或相对路径)，不填则默认为初始化cwd目录下的所有文件
    */
    svn.add(url).then(res=>{
         //do something
    }).catch(err=>{
        //something error
    })
```
`svn delete 删除代码`
```js
    /**
    *@param {String}（必填）要删除的仓库文件或文件夹的路径(绝对路径或相对路径) 
    */
    svn.add(url).then(res=>{
         //do something
    }).catch(err=>{
        //something error
    })
```

`svn commit 上传代码`
```js
    /**
    *@param {Object}（必填）要删除的仓库文件或文件夹的路径(绝对路径或相对路径) 
    * @description {name} 上传单个文件时name为文件或文件名的相对路径或绝对路径；若上传cwd路径下的所有文件，name传空
    * @description {msg} 本次上传说明
    */
    svn.commit(ops).then(res=>{
        //do something
    }).catch(err=>{
        //something error
    })
```

`svn upload 组合了以上方法，一键上传文件`
```js
     /**
     * @param {Object}
     * @description {name} 上传单个文件时name为文件或文件名的相对路径或绝对路径；若上传cwd路径下的所有文件，name传空
     * @description {msg} 本次上传说明
     */
    svn.upload(opts).then(res=>{
        //do something
    }).then(err=>{
         //something error
    })
```