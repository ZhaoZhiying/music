{
    let view = {
        el: '.page__main',
        template: `
            <form class="page__main__form">
                <div class="row">
                    <label>歌名</label>
                    <input name="name" type="text" value="__name__" autocomplete="off">
                </div>
                <div class="row">
                    <label>歌手</label>
                    <input name="singer" type="text" value="__singer__" autocomplete="off">
                </div>
                <div class="row">
                    <label>外链</label>
                    <input name="url" type="text" value="__url__" autocomplete="off">
                </div>
                <button class="page__main__form__save">保存</button>
            </form>
        `,
        render(data = {}){
            let placeholders = ['name', 'singer', 'url', 'id']
            let html = this.template
            placeholders.map((string)=>{
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
            //标题切换
            if(data.id){
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            }else{
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }
        },
        reset(){
            this.render({})
        },
    }

    let model = {
        data: {name: '', singer: '', url: '', id: ''},
        //更新
        update(data){
            var song = AV.Object.createWithoutData('Song', this.data.id)
            song.set('name', data.name)
            song.set('singer', data.singer)
            song.set('url', data.url)
            return song.save().then((response)=>{
                //更新成功就保存新的数据（由于 leanCloud 响应没有最新的数据）
                Object.assign(this.data, data) 
                return response
            })
        },
        create(data){
            // 声明类型
            var Song = AV.Object.extend('Song')
            // 新建对象
            var song = new Song()
            // 设置名称
            song.set('name', data.name)
            song.set('singer', data.singer)
            song.set('url', data.url)
            return song.save().then((newSong) => {
                //let id = newSong.id
                //let attributes = newSong.attributes
                let {id, attributes} = newSong
                Object.assign(this.data, {
                    id: id,
                    ...attributes //ES6 新语法，等于下面三行
                    //name: attributes.name,
                    //singer: attributes.singer,
                    //url: attributes.url
                })
            }, (error) => {
                console.error(error)
            })
        }
    }
    let controller = {
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            window.eventHub.on('select', (data)=>{
                this.model.data = data
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', (data)=>{
                //如果是数据库传来的 id，点击‘新建歌曲’就清空 form
                if(this.model.data.id){
                    this.model.data = {name: '', singer: '', url: '', id: ''}
                }else{
                    //如果数据库没有这个 id，就把 data 记录到 model 里
                    Object.assign(this.model.data, data)
                }
                this.view.render(this.model.data)
            })
        },
        save(){
            let needs = ['name', 'singer', 'url']
            let data = {}
            needs.map((string)=>{
                data[string] = $(this.view.el).find(`[name="${string}"]`).val()
            })
            this.model.create(data).then(()=>{
                this.view.reset()
                //成功创建，进行深拷贝 this.model.data
                let string = JSON.stringify(this.model.data)
                let object = JSON.parse(string)
                window.eventHub.emit('create', object)
            })
        },
        update(){
            let needs = ['name', 'singer', 'url']
            let data = {}
            needs.map((string)=>{
                data[string] = $(this.view.el).find(`[name="${string}"]`).val()
            })
            this.model.update(data).then(()=>{
                window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
            })
        },
        bindEvents(){
            $(this.view.el).on('submit', 'form', (e)=>{ //事件委托，因为一开始 form 不存在
                e.preventDefault()
                //判断歌曲是否存在
                if(this.model.data.id){
                    //收集用户编辑的信息
                    this.update()
                }else{
                    this.save()
                }
            }) 
        },
    }
    controller.init(view, model)
}