<template>
  <tk-container :status="status" class="shop">
    <tkui-header slot="header" background="white" color="#333" center>
      <tkui-button slot="left" class="icon" @click="$back">
        <tk-icon material>keyboard_arrow_left</tk-icon>
      </tkui-button>
      添加车型
    </tkui-header>

    <tkui-list>
      <tkui-input v-model="bikeName" label="车型名称" wrapLabel placeHolder="请填写车型名称"></tkui-input>
    </tkui-list>

    <tkui-list>
      <tkui-list-picker v-if="brands" v-model="brand" :items="brands" label="品牌" placeholder="请选择品牌"></tkui-list-picker>
      <tkui-input v-model="price" label="价格" wrapLabel placeHolder="请填写车型价格"></tkui-input>
      <tkui-input v-model="des" label="买卖亮点" wrapLabel placeHolder="请填写车型亮点"></tkui-input>
      <div class="tkui-input-container">
        <div class="tkui-input-body-warp wrap-label">
          <label class="tkui-label">产品图片</label>
          <div class="tkui-input-body">
            <tk-flex style="flex-direction: column;" class="img-wrap" middle center @click.native="pick">
              <div class="md-subheading">选择一个文件</div>
              <tk-image v-if="file && file.url" style="width: 60px;height:60px;" width="600" height="1200" class=" avatar" :src="file.url"></tk-image>
            </tk-flex>
          </div>
        </div>
      </div>
    </tkui-list>
    <span>
      <tkui-button v-if='btnType' primary raised big block @click="commit">提交</tkui-button>
      <tkui-button v-else primary raised big block disabled>图片上传中……</tkui-button>
    </span>
  </tk-container>
</template>

<script>
export default {
  name: 'newBike',
  layout: '',
  data () {
    return {
      bikeName: '',
      type: 'image',
      from: 'file',
      file: {},
      mainBrand: [],
      price: 0,
      des: '',
      brand: '',
      btnType: true,
      bike: {},
      status: 'loading'
    }
  },
  computed: {
    isImage () {
      return this.file && /image/.test(this.file.file.type)
    },
    userInfo () {
      return this.$store.state.user
    },
    brands () {
      let brands = {}
      this.mainBrand.forEach((n, i) => {
        this.userInfo.mainBrand.forEach((ni, ii) => {
          if (ni === n.objectId) {
            brands[n.objectId] = n.name
          }
        })
      })
      return brands
    },
    bikeId () {
      return this.$getFlash('bikeId')
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    async init () {
      try {
        this.getBrand()
        if (this.bikeId) {
          this.getBike()
        }
      } catch (e) {
        this.status = 'error'
        throw e
      }
      this.status = false
    },
    async getBike () {
      this.bike = await this.$tkParse.getFirst('/classes/model', {
        params: {
          where: {
            objectId: this.$getFlash('bikeId')
          }
        }
      })
      JSON.stringify(this.bike) !== '{}' ? this.status = false : this.status = 'empty'
      this.bikeName = this.bike.modelName
      this.brand = this.bike.brand
      this.price = this.bike.price
      this.des = this.bike.configInfo
      this.file['url'] = this.bike.tagImg
    },
    async getBrand () {
      this.mainBrand = await this.$tkParse.getList('/classes/brand', {
        params: {}
      })
    },
    pick () {
      this.$tkFile.pick({
        type: this.type,
        from: this.from
      }).then(file => {
        (async () => {
          this.btnType = false
          let res1 = await this.$tkParse.post('/files', file.buffer)
          this.file = res1.data
          this.btnType = true
        })()
      }).catch(e => {
        throw e
      })
    },
    async postModel () {
      await this.$tkParse.post('/classes/model', {
        user: this.userInfo.objectId,
        price: Number(this.price),
        tagImg: this.file.url || null,
        modelName: this.bikeName,
        configInfo: this.des,
        brand: this.brand
      }).catch(e => {
        this.$tkGlobal.toast.add('新增车型失败！')
        throw e
      })
      this.$tkGlobal.toast.add('新增车型成功！')
      this.$back()
    },
    async putModel () {
      await this.$tkParse.put('/classes/model/' + this.bikeId, {
        user: this.userInfo.objectId,
        price: Number(this.price),
        tagImg: this.file.url || null,
        modelName: this.bikeName,
        configInfo: this.des,
        brand: this.brand
      }).catch(e => {
        this.$tkGlobal.toast.add('修改车型失败！')
        throw e
      })
      this.$tkGlobal.toast.add('修改车型成功！')
      this.$back()
    },
    commit () {
      !this.$getFlash('bikeId') ? this.postModel() : this.putModel()
    }
  }
}
</script>

<style lang="scss" scoped>
  .tkui-list {
    padding:16px 16px 0 16px;
  }
  .tkui-list-item {
    padding:0;
    .right>span {
      max-width:200px;
      display:inline-block;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
    }
    .left {
      .tkui-list-picker-label {
        font-size:13px;
      }
    }
  }
  .tiny-img {
    height:80px;
    margin-top:16px;
  }
  .md-subheading {
    margin-bottom:10px;
  }

</style>
