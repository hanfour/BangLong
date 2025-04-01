import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * 獲取網站設定
 * 支持使用type參數過濾設定類型
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 可選過濾參數，如 type=seo 或 type=email
    
    let settings;
    
    if (type) {
      settings = await prisma.siteSettings.findMany({
        where: { type }
      });
    } else {
      settings = await prisma.siteSettings.findMany();
    }
    
    // 將設定轉換為更易於使用的格式
    const settingsMap: { [key: string]: { [key: string]: any } } = {};
    
    settings.forEach(setting => {
      if (!settingsMap[setting.type]) {
        settingsMap[setting.type] = {};
      }
      
      // 嘗試解析JSON值
      try {
        settingsMap[setting.type][setting.key] = JSON.parse(setting.value);
      } catch {
        // 如果不是有效的JSON，直接使用原始值
        settingsMap[setting.type][setting.key] = setting.value;
      }
    });
    
    return NextResponse.json({ 
      settings: settingsMap,
      raw: settings // 同時提供原始数據
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * 更新網站設定
 * 需要管理員權限
 */
export async function POST(request: Request) {
  try {
    // 驗證管理員身份
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '未授權的請求' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    if (!data.type || !data.key || data.value === undefined) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }
    
    // 將值轉換為字符串存儲
    const stringValue = typeof data.value === 'object' 
      ? JSON.stringify(data.value) 
      : String(data.value);
    
    // 使用 upsert 來創建或更新設定
    const setting = await prisma.siteSettings.upsert({
      where: {
        type_key: {
          type: data.type,
          key: data.key
        }
      },
      update: {
        value: stringValue,
        description: data.description
      },
      create: {
        type: data.type,
        key: data.key,
        value: stringValue,
        description: data.description
      }
    });
    
    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

/**
 * 批量更新設定
 */
export async function PUT(request: Request) {
  try {
    // 驗證管理員身份
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '未授權的請求' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    if (!data.settings || !Array.isArray(data.settings)) {
      return NextResponse.json(
        { error: '無效的設定數據' },
        { status: 400 }
      );
    }
    
    // 使用事務批量更新設定
    const results = await prisma.$transaction(
      data.settings.map((setting: any) => {
        const stringValue = typeof setting.value === 'object' 
          ? JSON.stringify(setting.value) 
          : String(setting.value);
        
        return prisma.siteSettings.upsert({
          where: {
            type_key: {
              type: setting.type,
              key: setting.key
            }
          },
          update: {
            value: stringValue,
            description: setting.description
          },
          create: {
            type: setting.type,
            key: setting.key,
            value: stringValue,
            description: setting.description
          }
        });
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error batch updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

/**
 * 刪除設定
 */
export async function DELETE(request: Request) {
  try {
    // 驗證管理員身份
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: '未授權的請求' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const key = searchParams.get('key');
    
    if (!type || !key) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }
    
    await prisma.siteSettings.delete({
      where: {
        type_key: { type, key }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: '已成功刪除設定'
    });
  } catch (error) {
    console.error('Error deleting setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}