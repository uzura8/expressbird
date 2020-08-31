<template>
<div class="chats">
  <h1 class="title">{{ $t('page.UserManagement') }}</h1>
  <section class="is-clearfix">
    <router-link
      to="/admin/users/create"
      class="button is-link is-pulled-right">
        <b-icon pack="fas" size="is-small" icon="plus"></b-icon>
        <span>{{ $t('page.createUser') }}</span>
    </router-link>
  </section>

  <table class="table">
    <thead>
      <tr>
        <th>id</th>
        <th>{{ $t('common.userName') }}</th>
        <th>{{ $t('common.type') }}</th>
        <th>{{ $t('common.createdAt') }}</th>
        <th>-</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user.id">
        <th>{{ user.id }}</th>
        <td v-text="user.type == 'anonymous' ? '' : user.name"></td>
        <td v-text="convUserTypeToi18n(user.type)"></td>
        <td>{{ user.createdAt | dateFormat('lll') }}</td>
        <td>
          <router-link
            class="has-text-grey-light"
            :to="`/admin/users/${user.id}/edit`"
          ><i class="fas fa-edit"></i></router-link>
        </td>
      </tr>
    </tbody>
  </table>

</div>
</template>

<script>
import { User } from '@/api'
export default{
  name: 'AdminUsers',

  data(){
    return {
      users: []
    }
  },

  components: {
  },

  created() {
    this.fetchUsers()
  },

  methods: {
    fetchUsers: async function () {
      this.users = await User.get('', this.authUserToken)
    }
  },
}
</script>

