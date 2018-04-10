{
    let view = {
        el: '.page__main',
        template: `
            <h1>新建歌曲</h1>
            <form class="form">
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
                <button class="save">保存</button>
            </form>
        `,
        render(data = {}){
            let placeholders = ['name', 'singer', 'url', 'id']
            let html = this.template
            placeholders.map((string)=>{
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
        },
        reset(){
            this.render({})
        },
    }

    let model = {
        data: {
            name: '',
            singer: '',
            url: '',
            id: ''
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
            window.eventHub.on('upload', (data)=>{
                this.view.render(data)
           })
        },
        bindEvents(){
            $(this.view.el).on('submit', 'form', (e)=>{ //事件委托，因为一开始 form 不存在
                e.preventDefault()
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
            }) 
        },
    }
    controller.init(view, model)
}