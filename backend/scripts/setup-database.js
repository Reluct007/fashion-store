#!/usr/bin/env node

/**
 * Cloudflare D1 数据库自动设置脚本 (Node.js 版本)
 * 使用方法: node scripts/setup-database.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: options.silent ? 'pipe' : 'inherit', ...options });
  } catch (error) {
    if (!options.silent) {
      console.error('执行失败:', error.message);
    }
    return null;
  }
}

async function checkWranglerInstalled() {
  try {
    execSync('wrangler --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function checkWranglerLogin() {
  try {
    const result = execSync('wrangler whoami', { encoding: 'utf8', stdio: 'pipe' });
    return result.trim();
  } catch {
    return null;
  }
}

async function createDatabase(dbName) {
  console.log(`\n📝 创建 D1 数据库: ${dbName}...`);
  
  try {
    const result = execSync(`wrangler d1 create ${dbName}`, { encoding: 'utf8' });
    console.log('✅ 数据库创建成功！');
    
    // 尝试从输出中提取 database_id
    const idMatch = result.match(/database_id = "([^"]+)"/) || result.match(/\b([a-f0-9]{32})\b/i);
    if (idMatch && idMatch[1]) {
      return idMatch[1];
    }
    
    // 如果无法自动提取，让用户手动输入
    console.log('\n⚠️  无法自动提取数据库 ID');
    console.log('请访问: https://dash.cloudflare.com/');
    console.log('进入 Workers & Pages > D1');
    console.log(`找到 '${dbName}' 数据库并复制 Database ID`);
    
    const dbId = await question('\n请输入数据库 ID: ');
    return dbId.trim();
  } catch (error) {
    console.error('❌ 创建数据库失败:', error.message);
    return null;
  }
}

function updateWranglerToml(dbId) {
  const wranglerFile = 'wrangler.toml';
  
  if (!fs.existsSync(wranglerFile)) {
    console.error(`❌ 找不到 ${wranglerFile} 文件`);
    return false;
  }
  
  let content = fs.readFileSync(wranglerFile, 'utf8');
  
  // 备份原文件
  fs.writeFileSync(`${wranglerFile}.backup`, content);
  
  // 更新 database_id
  if (content.includes('database_id = ""')) {
    content = content.replace('database_id = ""', `database_id = "${dbId}"`);
    fs.writeFileSync(wranglerFile, content);
    console.log('✅ wrangler.toml 已更新');
    return true;
  } else {
    // 检查是否已有 ID
    const existingIdMatch = content.match(/database_id = "([^"]+)"/);
    if (existingIdMatch && existingIdMatch[1]) {
      console.log(`⚠️  wrangler.toml 中已有 database_id: ${existingIdMatch[1]}`);
      const update = await question('是否更新为新的 ID? (y/n): ');
      if (update.toLowerCase() === 'y') {
        content = content.replace(/database_id = "[^"]+"/, `database_id = "${dbId}"`);
        fs.writeFileSync(wranglerFile, content);
        console.log('✅ wrangler.toml 已更新');
        return true;
      }
    }
    return false;
  }
}

async function initializeDatabase(dbName) {
  const migrationFile = 'migrations/0001_initial.sql';
  
  if (!fs.existsSync(migrationFile)) {
    console.log(`⚠️  找不到迁移文件: ${migrationFile}`);
    return false;
  }
  
  console.log('\n📊 初始化数据库表结构...');
  
  try {
    execSync(`wrangler d1 execute ${dbName} --file=${migrationFile}`, { stdio: 'inherit' });
    console.log('✅ 数据库初始化完成！');
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Fashion Store - D1 数据库设置向导');
  console.log('======================================\n');
  
  // 检查 wrangler
  if (!(await checkWranglerInstalled())) {
    console.log('❌ Wrangler CLI 未安装');
    console.log('正在安装...');
    exec('npm install -g wrangler');
  }
  
  // 检查登录状态
  console.log('📋 检查 Cloudflare 登录状态...');
  const loginInfo = await checkWranglerLogin();
  
  if (!loginInfo) {
    console.log('⚠️  未登录 Cloudflare，正在登录...');
    exec('wrangler login');
  } else {
    console.log('✅ 已登录 Cloudflare');
    console.log(loginInfo);
  }
  
  // 创建数据库
  const dbName = 'fashion-store-db';
  const dbId = await createDatabase(dbName);
  
  if (!dbId) {
    console.error('❌ 无法获取数据库 ID');
    rl.close();
    process.exit(1);
  }
  
  console.log(`\n📌 Database ID: ${dbId}`);
  
  // 更新 wrangler.toml
  updateWranglerToml(dbId);
  
  // 初始化数据库
  await initializeDatabase(dbName);
  
  console.log('\n✨ 数据库设置完成！');
  console.log('\n📋 下一步：');
  console.log('1. 部署后端: cd backend && npm run deploy');
  console.log('2. 访问管理面板: /admin');
  console.log('3. 使用默认凭证登录: admin / admin123');
  console.log('\n💡 提示：首次登录后请修改密码！\n');
  
  rl.close();
}

main().catch(console.error);

