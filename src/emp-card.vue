<template>
    <div>
        <p>
            <el-form ref="form" label-width="80px">
                <el-form-item label="姓名">
                    {{baseInfo.emp_name}}
                </el-form-item>
                <el-form-item label="头像">
                    <img :src="baseInfo.head_img_url" />
                </el-form-item>
                <el-form-item label="部门">
                    {{baseInfo.dep_name}}
                </el-form-item>
                <el-form-item label="工号">
                    {{baseInfo.emp_id}}
                </el-form-item>
                <el-form-item label="班次">
                    {{baseInfo.shift_info}}
                </el-form-item>
            </el-form>
        </p>
    </div>
</template>
<script>
import axios from 'axios'
export default {
    props: {
        query: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    data() {
        return {
            baseInfo: []
        }
    },
    computed: {
    },
    methods: {
        async getInfo() {
            try {
                const data = await axios.get('https://dev.2haohr.com/api/attendance2/api/card/employee/attend_overview/', {
                    params: this.query,
                    headers: {'accesstoken': '4mbiqv2549rn3nlvidesb4sqdoqfp22g'}
                })
                this.baseInfo = data.data.data
            } catch (e) {
                console.warn(e)
            }
        }
    },
    created() {
        this.getInfo()
    }
}
</script>